import { Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';

interface Props {
  storeName: string;
  onGo: () => void;
}

export default function StepDone({ storeName, onGo }: Props) {
  return (
    <div className="p-12 text-center font-sans">
      {/* Celebration Icon */}
      <div className="w-20 h-20 bg-green-50 border border-green-150 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-green-50/50">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      
      <h1 className="text-2xl font-bold text-slate-800 mb-3">
        {storeName ? `${storeName} جاهز تماماً!` : 'متجرك جاهز تماماً!'}
      </h1>
      
      <p className="text-slate-500 mb-2 text-sm leading-relaxed">
        تم إنشاء متجرك بنجاح وتفعيل النطاق الخاص بك وهو الآن متاح للزوار.
      </p>
      
      <p className="text-sm text-indigo-600 font-bold mb-8">
        يمكنك الآن إضافة منتجاتك وبدء استقبال الطلبات من عملائك.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onGo}
          className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
        >
          انتقل إلى لوحة التحكم
          <ArrowLeft className="w-4 h-4 mr-1" />
        </button>
      </div>

      <div className="mt-8 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl inline-flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        نصيحة: ابدأ بإضافة بعض المنتجات وربط بوابات الدفع لإحياء متجرك!
      </div>
    </div>
  );
}
