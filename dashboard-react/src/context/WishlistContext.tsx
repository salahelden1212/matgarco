import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

interface WishlistItem {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  salePrice?: number;
  averageRating?: number;
  reviewCount?: number;
  status: string;
  stock: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: WishlistItem) => void;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'guest_wishlist';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Local state for guest wishlist
  const [guestWishlist, setGuestWishlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Fetch server wishlist for authenticated users
  const { data: serverWishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistAPI.getAll(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const serverItems = serverWishlistData?.data?.data?.items || [];

  // Get all items (server items for auth, local items for guest)
  const items = isAuthenticated ? serverItems : guestWishlist.map(id => ({ _id: id } as WishlistItem));

  // Sync guest wishlist with server when user logs in
  const syncMutation = useMutation({
    mutationFn: (productIds: string[]) => wishlistAPI.sync(productIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
      setGuestWishlist([]);
    },
  });

  // Effect to sync guest wishlist when user logs in
  useEffect(() => {
    if (isAuthenticated && guestWishlist.length > 0) {
      syncMutation.mutate(guestWishlist);
    }
  }, [isAuthenticated]);

  // Save guest wishlist to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(guestWishlist));
    }
  }, [guestWishlist, isAuthenticated]);

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (productId: string) => wishlistAPI.add(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('تمت الإضافة إلى المفضلة');
    },
    onError: () => toast.error('فشل الإضافة إلى المفضلة'),
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (productId: string) => wishlistAPI.remove(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('تمت الإزالة من المفضلة');
    },
    onError: () => toast.error('فشل الإزالة من المفضلة'),
  });

  const isInWishlist = useCallback((productId: string) => {
    if (isAuthenticated) {
      return serverItems.some((item: WishlistItem) => item._id === productId);
    }
    return guestWishlist.includes(productId);
  }, [isAuthenticated, serverItems, guestWishlist]);

  const addToWishlist = useCallback((product: WishlistItem) => {
    if (isAuthenticated) {
      addMutation.mutate(product._id);
    } else {
      if (!guestWishlist.includes(product._id)) {
        setGuestWishlist(prev => [...prev, product._id]);
        toast.success('تمت الإضافة إلى المفضلة');
      }
    }
  }, [isAuthenticated, guestWishlist, addMutation]);

  const removeFromWishlist = useCallback((productId: string) => {
    if (isAuthenticated) {
      removeMutation.mutate(productId);
    } else {
      setGuestWishlist(prev => prev.filter(id => id !== productId));
      toast.success('تمت الإزالة من المفضلة');
    }
  }, [isAuthenticated, removeMutation]);

  const toggleWishlist = useCallback((product: WishlistItem) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  const clearWishlist = useCallback(() => {
    if (isAuthenticated) {
      // Call clear API
      wishlistAPI.clear().then(() => {
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        toast.success('تم إفراغ المفضلة');
      });
    } else {
      setGuestWishlist([]);
      toast.success('تم إفراغ المفضلة');
    }
  }, [isAuthenticated, queryClient]);

  const value: WishlistContextType = {
    items,
    isLoading: isAuthenticated ? isLoading : false,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    wishlistCount: isAuthenticated ? serverItems.length : guestWishlist.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
