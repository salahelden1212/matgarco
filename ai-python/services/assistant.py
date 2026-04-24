from services.qwen_client import qwen_client


class AssistantService:
    SYSTEM_PROMPT = """أنت "متجر مساعد" - مساعد ذكي خاص بمنصة متجاركو (Matgarco).

متجكو هي منصة تجارة إلكترونية متعددة المتاجر (مثل Shopify) تتيح للتجار إنشاء متاجرهم الإلكترونية بسهولة.

**مميزات المنصة:**
- إنشاء متجر إلكتروني مع نطاق فرعي خاص
- إدارة المنتجات والطلبات والعملاء
- تخصيص تصميم المتجر بقوالب جاهزة
- الدفع عبر Paymob (بوابة دفع مصرية)
- نظام اشتراكات متعدد المستويات
- لوحة تحكم شاملة للتاجر
- تقارير وتحليلات المبيعات

**خطط الاشتراك:**
- تجربة مجانية: 14 يوم، 20 منتج، 5 رصيد AI
- Starter: 250 جنيه/شهر، 100 منتج، 2 موظفين
- Professional: 450 جنيه/شهر، 500 منتج، 5 موظفين
- Business: 699 جنيه/شهر، منتجات غير محدودة، موظفين غير محدودين

**قواعد الرد:**
- كن مفيد ومباشر
- استخدم العربية الفصحى
- قدم إجابات عملية وخطوات محددة
- إذا لم تعرف الإجابة، اعترف بذلك واقترح موارد بديلة
- لا تخترع معلومات عن المنصة
- ركز على مساعدة التاجر في إدارة متجره"""

    @classmethod
    async def chat(
        cls,
        message: str,
        store_context: dict | None = None,
        conversation_history: list[dict] | None = None,
    ) -> str:
        system_prompt = cls.SYSTEM_PROMPT

        if store_context:
            context_info = []
            if store_context.get("storeName"):
                context_info.append(f"اسم المتجر: {store_context['storeName']}")
            if store_context.get("plan"):
                context_info.append(f"خطة الاشتراك: {store_context['plan']}")
            if store_context.get("totalProducts"):
                context_info.append(f"عدد المنتجات: {store_context['totalProducts']}")
            if store_context.get("totalOrders"):
                context_info.append(f"عدد الطلبات: {store_context['totalOrders']}")
            if store_context.get("totalRevenue"):
                context_info.append(f"إجمالي الإيرادات: {store_context['totalRevenue']} جنيه")

            if context_info:
                system_prompt += f"\n\n**معلومات متجر المستخدم الحالي:**\n" + "\n".join(context_info)

        messages = [{"role": "system", "content": system_prompt}]

        if conversation_history:
            messages.extend(conversation_history[-10:])

        messages.append({"role": "user", "content": message})

        return await qwen_client.chat_completion(
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
        )

    @classmethod
    async def suggest_actions(
        cls,
        store_context: dict,
    ) -> list[dict]:
        prompt = f"""بناءً على معلومات المتجر التالية، اقترح 3-5 إجراءات عملية يمكن للتاجر القيام بها الآن لتحسين متجره:

اسم المتجر: {store_context.get('storeName', 'غير محدد')}
الخطة: {store_context.get('plan', 'غير محدد')}
عدد المنتجات: {store_context.get('totalProducts', 0)}
عدد الطلبات: {store_context.get('totalOrders', 0)}
الإيرادات: {store_context.get('totalRevenue', 0)} جنيه

قدم الاقتراحات كقائمة JSON:
[
  {"action": "نص الإجراء", "reason": "السبب", "priority": "high/medium/low", "link": "/dashboard/..."}
]

اكتب JSON فقط."""

        messages = [
            {
                "role": "system",
                "content": "You are an e-commerce business advisor. Suggest actionable improvements based on store metrics. Return only valid JSON.",
            },
            {"role": "user", "content": prompt},
        ]

        result = await qwen_client.chat_completion(
            messages=messages,
            max_tokens=500,
            temperature=0.5,
        )

        import json

        try:
            suggestions = json.loads(result)
            if isinstance(suggestions, list):
                return suggestions
        except json.JSONDecodeError:
            pass

        return [
            {
                "action": "أضف منتجات جديدة",
                "reason": "زيادة المنتجات تجذب عملاء أكثر",
                "priority": "high",
                "link": "/dashboard/products/new",
            },
            {
                "action": "راجع طلباتك",
                "reason": "تأكد من معالجة جميع الطلبات",
                "priority": "high",
                "link": "/dashboard/orders",
            },
        ]


assistant_service = AssistantService()
