type PLAN = {
    id: string;
    title: string;
    desc: string;
    monthlyPrice: number;
    yearlyPrice: number;
    badge?: string;
    buttonText: string;
    features: string[];
    link: string;
};

export const PLANS: PLAN[] = [
    {
        id: "free",
        title: "Starter",
        desc: "Perfect for exploring AI compliance requirements",
        monthlyPrice: 0,
        yearlyPrice: 0,
        buttonText: "Start Free",
        features: [
            "1 AI system assessment",
            "Basic risk classification",
            "Summary compliance report",
            "Email support",
            "7-day report access"
        ],
        link: "/app"
    },
    {
        id: "pro",
        title: "Professional",
        desc: "For teams serious about staying compliant",
        monthlyPrice: 99,
        yearlyPrice: 990,
        badge: "Most Popular",
        buttonText: "Get Started",
        features: [
            "Unlimited assessments",
            "Detailed compliance reports",
            "Priority action plans",
            "Regulatory update alerts",
            "PDF export & sharing",
            "Priority email support",
            "12-month report history"
        ],
        link: "/app"
    },
    {
        id: "enterprise",
        title: "Enterprise",
        desc: "Custom solutions for large organizations",
        monthlyPrice: 0,
        yearlyPrice: 0,
        badge: "Contact Sales",
        buttonText: "Contact Sales",
        features: [
            "Everything in Professional",
            "Multi-organization support",
            "API access & integrations",
            "Dedicated compliance advisor",
            "Custom reporting templates",
            "SSO & advanced security",
            "SLA guarantee"
        ],
        link: "/contact"
    }
];
