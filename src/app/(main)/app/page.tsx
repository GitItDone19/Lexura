"use client"

import { useState, useEffect } from 'react'
import { 
    CheckCircle2Icon, 
    ClockIcon, 
    FileTextIcon, 
    PlusIcon,
    TrendingUpIcon,
    AlertCircleIcon,
    BarChart3Icon,
    SearchIcon
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from "@/components";
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AssessmentCard } from '@/components/dashboard/assessment-card';
import { StatsCard } from '@/components/dashboard/stats-card';

interface DashboardStats {
    totalScans: number;
    inProgress: number;
    completed: number;
    avgScore: number;
    userRole: 'CLIENT' | 'ADMIN';
}

interface Scan {
    id: string;
    name: string;
    status: 'IN_PROGRESS' | 'COMPLETED';
    score: number | null;
    updatedAt: string;
    progress: number;
}

const Page = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [scans, setScans] = useState<Scan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, scansRes] = await Promise.all([
                    fetch('/api/dashboard/stats'),
                    fetch('/api/assessments/recent')
                ]);

                if (statsRes.ok && scansRes.ok) {
                    const statsData = await statsRes.json();
                    const scansData = await scansRes.json();
                    setStats(statsData);
                    setScans(scansData);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredScans = scans.filter(scan =>
        scan.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64 bg-zinc-900" />
                        <Skeleton className="h-4 w-96 bg-zinc-900" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-40 bg-zinc-900" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto" />
                    <p className="text-zinc-400">Failed to load dashboard data</p>
                    <Button onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="p-6 md:p-8 lg:p-10">
                <div className="w-full space-y-6">
                    {/* Header Section */}
                    <Container>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                        Compliance Dashboard
                                    </h1>
                                    {stats.userRole === 'ADMIN' && (
                                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 text-xs">
                                            Admin
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-zinc-400 text-xs">
                                    Monitor and manage your EU AI Act compliance scans
                                </p>
                            </div>
                            <Button 
                                asChild 
                                size="sm" 
                                className="bg-white hover:bg-zinc-100 text-black transition-all hover:scale-105 font-semibold"
                            >
                                <Link href="/app/assessment/new" className="gap-1.5">
                                    <PlusIcon className="w-4 h-4" />
                                    New Scan
                                </Link>
                            </Button>
                        </div>
                    </Container>

                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Container>
                            <StatsCard
                                title="Total Scans"
                                value={stats.totalScans}
                                subtitle="All time scans"
                                icon={BarChart3Icon}
                            />
                        </Container>

                        <Container delay={0.1}>
                            <StatsCard
                                title="In Progress"
                                value={stats.inProgress}
                                subtitle="Active scans"
                                icon={ClockIcon}
                            />
                        </Container>

                        <Container delay={0.2}>
                            <StatsCard
                                title="Completed"
                                value={stats.completed}
                                subtitle="Finished scans"
                                icon={CheckCircle2Icon}
                            />
                        </Container>

                        <Container delay={0.3}>
                            <StatsCard
                                title="Avg Compliance"
                                value={stats.avgScore > 0 ? `${stats.avgScore}%` : 'N/A'}
                                subtitle="Average score"
                                icon={TrendingUpIcon}
                            />
                        </Container>
                    </div>

                    {/* Scans Section */}
                    {scans.length > 0 && (
                        <Container delay={0.4}>
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-0.5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                                            <h2 className="text-base text-white font-semibold">
                                                Recent Scans
                                            </h2>
                                        </div>
                                        <p className="text-xs text-zinc-500 ml-3.5">
                                            Your most recent compliance scans
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1 md:w-64">
                                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                                            <Input
                                                placeholder="Search scans..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9 h-9 text-xs bg-zinc-950 border-zinc-800 focus:border-blue-500 text-white placeholder:text-zinc-500"
                                            />
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            asChild
                                            className="border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-xs"
                                        >
                                            <Link href="/app/assessments">
                                                View All
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                {/* Scan Cards Grid */}
                                {filteredScans.length > 0 ? (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {filteredScans.map((scan) => (
                                            <AssessmentCard
                                                key={scan.id}
                                                id={scan.id}
                                                name={scan.name}
                                                status={scan.status}
                                                score={scan.score}
                                                updatedAt={scan.updatedAt}
                                                progress={scan.progress}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 mb-3">
                                            <SearchIcon className="w-6 h-6 text-zinc-600" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-white mb-1.5">
                                            No scans found
                                        </h3>
                                        <p className="text-xs text-zinc-500 mb-4 max-w-sm mx-auto">
                                            Try adjusting your search terms
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Container>
                    )}

                    {/* Empty State */}
                    {scans.length === 0 && (
                        <Container delay={0.4}>
                            <Card className="bg-zinc-950 border-zinc-800">
                                <CardContent className="py-12">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 mb-3">
                                            <FileTextIcon className="w-6 h-6 text-zinc-600" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-white mb-1.5">
                                            No scans yet
                                        </h3>
                                        <p className="text-xs text-zinc-500 mb-4 max-w-sm mx-auto">
                                            Get started by creating your first compliance scan
                                        </p>
                                        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                                                <Link href="/app/assessment/new" className="gap-1.5">
                                                    <PlusIcon className="w-3.5 h-3.5" />
                                                    Create Your First Scan
                                                </Link>
                                            </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Container>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Page;
