import { Navbar } from "@/components/layout/Navbar";
import { GlobalFooter } from "@/components/sections/GlobalFooter";

export const metadata = {
  title: "Refund & Return Policy | Matgarco",
  description: "Matgarco refund and return policy — how refunds and returns are handled on our platform.",
};

export default function RefundPage() {
  return (
    <div className="w-full bg-[#000000] min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-24">
        <h1 className="text-4xl font-bold text-white mb-4">سياسة الاسترجاع والاسترداد</h1>
        <p className="text-gray-400 text-sm mb-8">آخر تحديث: يونيو 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">نظرة عامة</h2>
            <p>تهدف سياسة الاسترجاع والاسترداد إلى تنظيم عملية إرجاع المنتجات واسترداد المبالغ المالية بين التجار والعملاء على منصة ماتجاركو.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">سياسة الاسترجاع للتجار</h2>
            <p>كصاحب متجر، يمكنك تحديد سياسة الاسترجاع الخاصة بك والتي ستظهر للعملاء عند الشراء. يمكن إعداد سياسات مختلفة لكل منتج أو فئة.</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>فترة الإرجاع: يمكنك تحديد المدة المسموح فيها بالإرجاع (مثلاً 14 يوماً)</li>
              <li>حالة المنتج: اشتراط أن يكون المنتج في حالته الأصلية وغير مستخدم</li>
              <li>رسوم الإرجاع: تحديد من يتحمل تكلفة الشحن للإرجاع</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">استرداد المدفوعات</h2>
            <p>عند استخدام نموذج الدفع الإجمالي لماتجاركو:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>يتم تحويل طلب الاسترداد إلى التاجر للموافقة</li>
              <li>بعد موافقة التاجر، تقوم ماتجاركو بمعالجة الاسترداد خلال 5-10 أيام عمل</li>
              <li>يتم إرجاع المبلغ إلى نفس طريقة الدفع المستخدمة في الشراء</li>
              <li>تُخصم رسوم المعاملة من مبلغ الاسترداد</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">استثناءات الاسترجاع</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>المنتجات الرقمية بعد تنزيلها (غير قابلة للاسترجاع)</li>
              <li>المنتجات المخصصة حسب الطلب</li>
              <li>المنتجات التي تم استخدامها أو تلفها بسبب سوء الاستخدام</li>
              <li>المنتجات المخفضة أو منتهية الصلاحية (حسب سياسة التاجر)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">إجراءات تقديم طلب استرجاع</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>قم بتسجيل الدخول إلى حسابك وانتقل إلى صفحة الطلب</li>
              <li>اختر المنتج الذي ترغب في إرجاعه</li>
              <li>اختر سبب الإرجاع وأرفق صوراً للمنتج (إن لزم الأمر)</li>
              <li>انتظر موافقة التاجر على طلب الإرجاع</li>
              <li>بعد الموافقة، قم بإرسال المنتج إلى العنوان المحدد</li>
              <li>سيتم استرداد المبلغ بعد استلام المنتج والتحقق منه</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">اشتراكات ماتجاركو</h2>
            <p>في حالة إلغاء اشتراك ماتجاركو:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>يمكن إلغاء الاشتراك في أي وقت من لوحة التحكم</li>
              <li>يتم إيقاف تجديد الاشتراك تلقائياً بعد الإلغاء</li>
              <li>لا يتم استرداد الرسوم المدفوعة عن الفترة المتبقية من الاشتراك</li>
              <li>يستمر وصولك للمنصة حتى نهاية فترة الفوترة الحالية</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">حل النزاعات</h2>
            <p>في حالة وجود نزاع بين التاجر والعميل بشأن الاسترجاع، يمكن التواصل مع فريق دعم ماتجاركو عبر البريد الإلكتروني: disputes@matgarco.com وسنقوم بالمساعدة في حل النزاع وفقاً للسياسات المطبقة.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">اتصل بنا</h2>
            <p>للاستفسارات المتعلقة بسياسة الاسترجاع والاسترداد، يرجى التواصل عبر: refunds@matgarco.com</p>
          </section>
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
}
