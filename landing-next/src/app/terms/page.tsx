import { Navbar } from "@/components/layout/Navbar";
import { GlobalFooter } from "@/components/sections/GlobalFooter";

export const metadata = {
  title: "Terms of Service | Matgarco",
  description: "Matgarco terms of service — rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="w-full bg-[#000000] min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-24">
        <h1 className="text-4xl font-bold text-white mb-4">شروط الخدمة</h1>
        <p className="text-gray-400 text-sm mb-8">آخر تحديث: يونيو 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">قبول الشروط</h2>
            <p>باستخدام منصة ماتجاركو، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك عدم استخدام المنصة.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">وصف الخدمة</h2>
            <p>ماتجاركو هي منصة تجارة إلكترونية تمكن التجار من إنشاء وإدارة متاجرهم الإلكترونية، مع ميزات تشمل إدارة المنتجات، معالجة المدفوعات، إدارة الشحن، وأدوات التسويق.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">حسابات المستخدمين</h2>
            <p>أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور. يجب عليك إخطارنا فوراً بأي استخدام غير مصرح به لحسابك.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">الاشتراكات والمدفوعات</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>يتم تحصيل رسوم الاشتراك شهرياً أو سنوياً حسب الخطة المختارة</li>
              <li>يتم إصدار فواتير بشكل تلقائي في تاريخ تجديد الاشتراك</li>
              <li>يمكن إلغاء الاشتراك في أي وقت</li>
              <li>لا يتم استرداد المدفوعات في حالة الإلغاء قبل نهاية فترة الفوترة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">المحتوى والملكية الفكرية</h2>
            <p>أنت تحتفظ بجميع حقوق الملكية الفكرية للمحتوى الذي تنشره على متجرك. بموجب هذه الشروط، تمنحنا ترخيصاً لاستضافة وعرض هذا المحتوى لتشغيل المنصة.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">الدفع الإجمالي (Aggregator Model)</h2>
            <p>عند استخدام نموذج الدفع الإجمالي، تقوم ماتجاركو بتحصيل المدفوعات نيابة عن التاجر، وتخصم العمولة المستحقة، ثم تحول صافي المبلغ إلى حساب التاجر وفقاً لجدول المدفوعات المتفق عليه.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">السلوك المحظور</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>بيع المنتجات غير القانونية أو المحظورة</li>
              <li>انتحال شخصية أي شخص أو كيان</li>
              <li>محاولة اختراق أمن المنصة</li>
              <li>استخدام المنصة لنشر البرامج الضارة</li>
              <li>انتهاك حقوق الملكية الفكرية للآخرين</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">إخلاء المسؤولية</h2>
            <p>تُقدم المنصة "كما هي" دون أي ضمانات. لا نضمن أن تكون الخدمة دون انقطاع أو خالية من الأخطاء.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">تعديل الشروط</h2>
            <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنخطر المستخدمين بالتغييرات الجوهرية قبل 30 يوماً من تاريخ السريان.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">القانون المطبق</h2>
            <p>تخضع هذه الشروط للقوانين واللوائح المعمول بها في جمهورية مصر العربية.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">اتصل بنا</h2>
            <p>للاستفسارات المتعلقة بشروط الخدمة، يرجى التواصل عبر: legal@matgarco.com</p>
          </section>
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
}
