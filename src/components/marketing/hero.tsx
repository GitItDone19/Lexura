import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { BlurText } from "../ui/blur-text";
import { Button } from "../ui/button";
import { BorderBeam } from "../ui/border-beam";
import { motion } from "framer-motion";
import Image from "next/image";
import Container from "../global/container";

const Hero = () => {
    return (
        <div className="flex flex-col items-center text-center w-full my-24 mx-auto z-40 relative px-4">
            <Container delay={0.0}>
                <div className="pl-2 pr-1 py-1 rounded-full border border-foreground/10 hover:border-foreground/15 backdrop-blur-lg cursor-pointer flex items-center gap-2.5 select-none w-max mx-auto">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary/40 flex items-center justify-center relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping"></div>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        </div>
                    </div>
                    <span className="inline-flex items-center justify-center gap-2 animate-text-gradient animate-background-shine bg-gradient-to-r from-[#93c5fd] via-[#3b82f6] to-[#bfdbfe] bg-[200%_auto] bg-clip-text text-sm text-transparent">
                        EU AI Act Compliance Platform
                    </span>
                </div>
            </Container>
            <div className="max-w-5xl mx-auto">
                <BlurText
                    word={"AI Done Right"}
                    className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent py-2 md:py-0 lg:!leading-snug font-bold racking-[-0.0125em] mt-6 font-heading"
                />
                <Container delay={0.1}>
                    <p className="text-sm sm:text-base lg:text-lg mt-4 text-accent-foreground/60 max-w-2xl mx-auto">
                        Secure audit-ready reports and total risk visibility for your AI systems in minutes.
                    </p>
                </Container>
                <Container delay={0.2}>
                    <div className="flex items-center justify-center md:gap-x-6 mt-8">
                        <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
                            <Link href="/app">
                                Try Lexura
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="hidden md:flex">
                            <Link href="#features">
                                Learn More
                            </Link>
                        </Button>
                    </div>
                </Container>
            </div>
            <Container delay={0.3}>
                <div className="relative pt-48 pb-0 md:pt-56 md:pb-0 bg-transparent w-full max-w-7xl mx-auto px-6">
                    {/* Blue gradient glow effect */}
                    <div className="absolute top-[20%] md:top-[25%] left-1/2 gradient w-3/4 -translate-x-1/2 h-1/4 md:h-1/3 blur-[5rem] animate-image-glow"></div>
                    
                    {/* Dashboard image container */}
                    <div className="-m-2 rounded-xl p-2 ring-1 ring-inset ring-foreground/20 lg:-m-4 lg:rounded-2xl bg-opacity-50 backdrop-blur-3xl relative">
                        <BorderBeam
                            size={250}
                            duration={12}
                            delay={9}
                        />
                        <Image
                            src="/images/dashboard.png"
                            alt="Dashboard"
                            width={1920}
                            height={1080}
                            quality={100}
                            className="rounded-md lg:rounded-xl bg-foreground/10 ring-1 ring-border w-full h-auto"
                        />
                        {/* Bottom gradient fade */}
                        <div className="absolute -bottom-2 inset-x-0 w-full h-1/4 bg-gradient-to-t from-background z-40"></div>
                        <div className="absolute bottom-0 md:-bottom-4 inset-x-0 w-full h-1/6 bg-gradient-to-t from-background z-50"></div>
                    </div>
                </div>
            </Container>
        </div>
    )
};

export default Hero
