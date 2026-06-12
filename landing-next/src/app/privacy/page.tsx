import { Navbar } from "@/components/layout/Navbar";
import { GlobalFooter } from "@/components/sections/GlobalFooter";

export const metadata = {
  title: "Privacy Policy | Matgarco",
  description: "Matgarco privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="w-full bg-[#000000] min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-24">
        <h1 className="text-4xl font-bold text-white mb-4">سياسة الخصوصية</h1>
        <p className="text-gray-400 text-sm mb-8">آخر تحديث: يونيو 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">مقدمة</h2>
            <p>نحن في ماتجاركو نلتزم بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدام منصتنا.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">المعلومات التي نجمعها</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>معلومات الحساب: الاسم، البريد الإلكتروني، رقم الهاتف، العنوان</li>
              <li>معلومات المتجر: اسم المتجر، الشعار، معلومات الدفع، إعدادات المتجر</li>
              <li>معلومات الطلب: بيانات العملاء، تفاصيل الطلبات، سجل المشتريات</li>
              <li>بيانات الاستخدام: كيفية تفاعلك مع المنصة، الصفحات التي تزورها</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">كيف نستخدم معلوماتك</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>لتقديم وتحسين خدمات المنصة</li>
              <li>لمعالجة الطلبات والمدفوعات</li>
              <li>لإرسال إشعارات مهمة حول حسابك</li>
              <li>لتقديم الدعم الفني وخدمة العملاء</li>
              <li>لتحسين تجربة المستخدم وتطوير الميزات</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">مشاركة المعلومات</h2>
            <p>لا نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>مع شركات الدفع (مثل Paymob) لمعالجة المعاملات</li>
              <li>مع شركات الشحن (مثل Bosta) لتوصيل الطلبات</li>
              <li>عندما يقتضي القانون ذلك</li>
              <li>بموافقتك الصريحة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">حماية البيانات</h2>
            <p>نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الإفشاء، بما في ذلك التشفير وجدران الحماية وأنظمة كشف الاختراق.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">حقوقك</h2>
            <p>لديك الحق في:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>الوصول إلى بياناتك الشخصية وتصحيحها</li>
              <li>طلب حذف بياناتك</li>
              <li>الاعتراض على معالجة بياناتك</li>
              <li>تصدير بياناتك بصيغة متاحة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">الكوكيز (Cookies)</h2>
            <p>نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك التحكم في إعدادات الكوكيز من متصفحك في أي وقت.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">التحديثات</h2>
            <p>قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">اتصل بنا</h2>
            <p>إذا كانت لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: privacy@matgarco.com</p>
          </section>
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
}
