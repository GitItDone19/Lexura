import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";

export const satoshi2 = localFont({
    src: [
        {
            path: "../../public/fonts/Satoshi-Light.woff2",
            weight: "300",
        },
        {
            path: "../../public/fonts/Satoshi-Regular.woff2",
            weight: "400",
        },
        {
            path: "../../public/fonts/Satoshi-Medium.woff2",
            weight: "500",
        },
        {
            path: "../../public/fonts/Satoshi-Bold.woff2",
            weight: "700",
        },
        {
            path: "../../public/fonts/Satoshi-Black.woff2",
            weight: "900",
        },
    ],
    variable: "--font-satoshi",
});

export const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
    weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});
