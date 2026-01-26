"use client";

import Container from "../global/container";
import Images from "../global/images";
import MagicCard from "../ui/magic-card";

const Features = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full">
            <Container>
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug">
                        Compliance Made <br /> Simple & Actionable
                    </h2>
                    <p className="text-base md:text-lg text-center text-accent-foreground/80 mt-6">
                        Everything you need to understand your AI regulatory obligations through guided assessments and expert recommendations.
                    </p>
                </div>
            </Container>
            <div className="mt-16 w-full">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                        <MagicCard particles={true} className="flex flex-col items-start w-full bg-primary/[0.08]">
                            <div className="bento-card w-full flex-col gap-6">
                                <div className="w-full h-40">
                                    <Images.analytics className="w-full h-full" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-xl font-heading font-medium heading ">
                                        Guided Assessment
                                    </h4>
                                    <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                        Complete a comprehensive assessment in three simple steps with intelligent routing.
                                    </p>
                                </div>
                            </div>
                        </MagicCard>

                        <MagicCard particles={true} className="flex flex-col items-start w-full bg-primary/[0.08]">
                            <div className="bento-card w-full flex-col gap-6">
                                <div className="w-full h-40 relative">
                                    <Images.ideation className="w-full h-full" />
                                    <div className="w-40 h-40 rounded-full bg-primary/10 blur-3xl -z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-xl font-heading font-medium heading">
                                        Smart Classification
                                    </h4>
                                    <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                        Automatically classify your AI system based on risk categories with detailed explanations.
                                    </p>
                                </div>
                            </div>
                        </MagicCard>

                        <MagicCard particles={true} className="flex flex-col items-start w-full bg-primary/[0.08]">
                            <div className="bento-card w-full flex-col gap-6">
                                <div className="w-full h-40 relative">
                                    <Images.integration className="w-full h-full" />
                                    <div className="w-28 h-28 rounded-full bg-primary/10 blur-3xl -z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"></div>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-xl font-heading font-medium heading ">
                                        Compliance Reports
                                    </h4>
                                    <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                        Generate comprehensive reports with actionable recommendations and priority action plans.
                                    </p>
                                </div>
                            </div>
                        </MagicCard>

                        <MagicCard particles={true} className="flex flex-col items-start w-full bg-primary/[0.08]">
                            <div className="bento-card w-full flex-col gap-6">
                                <div className="w-full h-40">
                                    <Images.image className="w-full h-full" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-xl font-heading font-medium heading ">
                                        Visual Compliance Scores
                                    </h4>
                                    <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                        Track your progress with clear visual indicators and detailed requirement breakdowns.
                                    </p>
                                </div>
                            </div>
                        </MagicCard>

                        <MagicCard particles={true} className="flex flex-col items-start w-full bg-primary/[0.08]">
                            <div className="bento-card w-full flex-col gap-6">
                                <div className="w-full h-40">
                                    <Images.hash className="w-full h-full" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-xl font-heading font-medium heading ">
                                        Regulatory Monitoring
                                    </h4>
                                    <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                        Stay informed about regulatory updates to ensure continuous compliance with AI legislation.
                                    </p>
                                </div>
                            </div>
                        </MagicCard>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default Features;
