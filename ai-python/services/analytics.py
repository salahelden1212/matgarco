import json
from services.qwen_client import qwen_client


class AnalyticsInsightsService:
    @classmethod
    def _build_prompt(cls, analytics_data: dict, question: str = "") -> str:
        data_summary = json.dumps(analytics_data, indent=2, ensure_ascii=False)

        prompt = f"""أنت خبير تحليل بيانات للتجارة الإلكترونية.

لديك البيانات التالية لمتجر إلكتروني:

{data_summary}
"""

        if question:
            prompt += f"""
سؤال المستخدم: {question}

قم بالرد على السؤال بناءً على البيانات المقدمة. قدم:
1. إجابة مباشرة
2. تحليل مفصل
3. توصيات عملية قابلة للتنفيذ
4. توقعات مستقبلية إن أمكن
"""
        else:
            prompt += """
قم بتحليل هذه البيانات وتقديم تقرير شامل يتضمن:

1. **ملخص الأداء**: نظرة عامة على أداء المتجر
2. **أبرز النقاط الإيجابية**: ما الذي يسير بشكل جيد
3. **النقاط التي تحتاج تحسين**: مجالات الضعف والفرص
4. **توصيات عملية**: 3-5 توصيات محددة وقابلة للتنفيذ
5. **توقعات**: توقعات للأداء خلال الشهر القادم بناءً على الاتجاهات
6. **تحذيرات**: أي مؤشرات خطر تحتاج انتباه فوري

اكتب التقرير بالعربية الفصحى بشكل احترافي ومنظم.
استخدم أرقام ونسب مئوية من البيانات لدعم تحليلك.
"""

        return prompt

    @classmethod
    async def generate_insights(
        cls,
        analytics_data: dict,
        question: str = "",
        language: str = "ar",
    ) -> str:
        prompt = cls._build_prompt(analytics_data, question)

        messages = [
            {
                "role": "system",
                "content": "You are an expert e-commerce data analyst. Provide data-driven insights with specific numbers and percentages. Always be actionable and practical. Respond in the requested language.",
            },
            {"role": "user", "content": prompt},
        ]

        return await qwen_client.chat_completion(
            messages=messages,
            max_tokens=2000,
            temperature=0.5,
        )

    @classmethod
    async def generate_product_recommendations(
        cls,
        products_data: list[dict],
        orders_data: list[dict],
    ) -> str:
        products_json = json.dumps(products_data[:20], indent=2, ensure_ascii=False)
        orders_json = json.dumps(orders_data[:20], indent=2, ensure_ascii=False)

        prompt = f"""أنت خبير إدارة منتجات للتجارة الإلكترونية.

بيانات المنتجات:
{products_json}

بيانات الطلبات الأخيرة:
{orders_json}

قدم توصيات محددة حول:
1. **المنتجات الرائدة**: أي المنتجات تحقق أفضل مبيعات ولماذا
2. **المنتجات الراكدة**: أي منتجات تحتاج تدخل (تخفيض سعر، تحسين وصف، إزالة)
3. **فرص جديدة**: منتجات أو فئات يمكن إضافتها بناءً على أنماط الشراء
4. **تحسين المخزون**: توصيات لإدارة المخزون بشكل أفضل
5. **استراتيجيات التسعير**: اقتراحات لتحسين الأسعار والأرباح

اكتب التوصيات بالعربية بشكل عملي ومحدد.
"""

        messages = [
            {
                "role": "system",
                "content": "You are an e-commerce product management expert. Provide specific, data-driven product recommendations.",
            },
            {"role": "user", "content": prompt},
        ]

        return await qwen_client.chat_completion(
            messages=messages,
            max_tokens=1500,
            temperature=0.5,
        )

    @classmethod
    async def generate_customer_insights(
        cls,
        customers_data: list[dict],
        orders_data: list[dict],
    ) -> str:
        customers_json = json.dumps(customers_data[:20], indent=2, ensure_ascii=False)
        orders_json = json.dumps(orders_data[:30], indent=2, ensure_ascii=False)

        prompt = f"""أنت خبير تحليل سلوك العملاء للتجارة الإلكترونية.

بيانات العملاء:
{customers_json}

بيانات الطلبات:
{orders_json}

قدم تحليل شامل يتضمن:
1. **ملخص العملاء**: عدد العملاء، متوسط الإنفاق، أنماط الشراء
2. **شرائح العملاء**: تقسيم العملاء إلى شرائح (جدد، متكررين، مخلصين، خاملين)
3. **توصيات التسويق**: كيف تستهدف كل شريحة بشكل أفضل
4. **برامج الولاء**: اقتراحات لبرامج ولاء فعالة
5. **معدل الاحتفاظ**: تحليل معدل الاحتفاظ بالعملاء وكيفية تحسينه

اكتب التحليل بالعربية بشكل عملي ومحدد.
"""

        messages = [
            {
                "role": "system",
                "content": "You are an e-commerce customer analytics expert. Provide actionable customer insights.",
            },
            {"role": "user", "content": prompt},
        ]

        return await qwen_client.chat_completion(
            messages=messages,
            max_tokens=1500,
            temperature=0.5,
        )


analytics_insights_service = AnalyticsInsightsService()
