"use client";

import MobileSidebar from "@/components/dashboard/mobile-sidebar";
import Icons from "@/components/global/icons";
import { HelpCircleIcon, ZapIcon } from "lucide-react";
import Link from "next/link";
import Container from "../global/container";
import { Button } from "../ui/button";

const DashboardNavbar = () => {
    return (
        <header id="dashboard-navbar" className="fixed top-0 inset-x-0 w-full h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 z-50">
            <Container className="flex items-center justify-end size-full">
                <div className="flex items-center gap-x-2">
                    <Button
                        size="sm"
                        className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 border-0"
                    >
                        <ZapIcon className="size-4 mr-1.5 text-white fill-white" />
                        Upgrade
                    </Button>
                    <Button
                        asChild
                        size="icon"
                        variant="ghost"
                        className="hidden lg:flex hover:bg-primary/10"
                    >
                        <Link href="/help" target="_blank">
                            <HelpCircleIcon className="size-5" />
                        </Link>
                    </Button>
                    <MobileSidebar />
                </div>
            </Container>
        </header>
    )
};

export default DashboardNavbar
