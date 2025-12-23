"use client";

import { useEffect, useRef, useMemo } from "react";
import { ICandidate } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfileHeader from "./ProfileHeader";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";
import {
  FiActivity,
  FiAward,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiTarget,
  FiPieChart,
} from "react-icons/fi";
import gsap from "gsap";
import Link from "next/link";

interface CandidateProfileProps {
  data: ICandidate;
}

const CandidateProfile = ({ data }: CandidateProfileProps) => {
  const { user, interview: interviews, address } = data;
  const statsRef = useRef<HTMLDivElement>(null);
  const interviewsRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const completedInterviews = useMemo(
    () => interviews.filter((i) => i.isCompleted),
    [interviews]
  );

  const averageScore = useMemo(() => {
    if (completedInterviews.length === 0) return 0;
    return (
      completedInterviews.reduce((acc, i) => acc + (i.score || 0), 0) /
      completedInterviews.length
    );
  }, [completedInterviews]);

  const highestScore = useMemo(
    () => Math.max(...completedInterviews.map((i) => i.score || 0), 0),
    [completedInterviews]
  );

  // Chart data for score trend
  const scoreTrendData = useMemo(() => {
    return completedInterviews.slice(-10).map((interview, index) => ({
      name: `#${index + 1}`,
      score: interview.score || 0,
      date: new Date(interview.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [completedInterviews]);

  // Chart data for interview status distribution
  const statusDistributionData = useMemo(() => {
    const completed = interviews.filter((i) => i.isCompleted).length;
    const inProgress = interviews.filter(
      (i) => !i.isCompleted && i.isActive
    ).length;
    const pending = interviews.filter(
      (i) => !i.isCompleted && !i.isActive
    ).length;
    return [
      { name: "Completed", value: completed, fill: "#22c55e" },
      { name: "In Progress", value: inProgress, fill: "#f59e0b" },
      { name: "Pending", value: pending, fill: "#94a3b8" },
    ].filter((d) => d.value > 0);
  }, [interviews]);

  // Chart data for score distribution (bar chart)
  const scoreDistributionData = useMemo(() => {
    const ranges = [
      { range: "0-20", min: 0, max: 20, count: 0 },
      { range: "21-40", min: 21, max: 40, count: 0 },
      { range: "41-60", min: 41, max: 60, count: 0 },
      { range: "61-80", min: 61, max: 80, count: 0 },
      { range: "81-100", min: 81, max: 100, count: 0 },
    ];
    completedInterviews.forEach((interview) => {
      const score = interview.score || 0;
      const range = ranges.find((r) => score >= r.min && score <= r.max);
      if (range) range.count++;
    });
    return ranges;
  }, [completedInterviews]);

  // Chart configurations
  const scoreTrendConfig: ChartConfig = {
    score: {
      label: "Score",
      color: "#4a7199",
    },
  };

  const scoreDistributionConfig: ChartConfig = {
    count: {
      label: "Interviews",
      color: "#4a7199",
    },
  };

  const statusConfig: ChartConfig = {
    completed: { label: "Completed", color: "#22c55e" },
    inProgress: { label: "In Progress", color: "#f59e0b" },
    pending: { label: "Pending", color: "#94a3b8" },
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".stat-card",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.3,
        }
      );

      gsap.fromTo(
        ".interview-item",
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
          delay: 0.5,
        }
      );

      gsap.fromTo(
        ".chart-card",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.15,
          ease: "power2.out",
          delay: 0.4,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-gray-400";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-main";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-400";
  };

  const stats = [
    {
      icon: FiActivity,
      label: "Total Interviews",
      value: interviews.length,
      color: "text-main",
      bg: "bg-main/10",
    },
    {
      icon: FiCheckCircle,
      label: "Completed",
      value: completedInterviews.length,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: FiTrendingUp,
      label: "Average Score",
      value: `${averageScore.toFixed(1)}%`,
      color: "text-main",
      bg: "bg-main/10",
    },
    {
      icon: FiAward,
      label: "Highest Score",
      value: `${highestScore}%`,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="">
      <ProfileHeader user={user} address={address} />

      {/* Stats Grid */}
      <div
        ref={statsRef}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 "
      >
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="stat-card bg-white border-gray-100 hover:shadow-md transition-shadow duration-300 cursor-default"
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6  ">
        {/* Score Trend Chart */}
        <Card className="chart-card w-[calc(100vw-48px)] md:w-full  lg:col-span-2 bg-white border-gray-100 ">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800 ">
              <FiTrendingUp className="w-5 h-5 text-main" />
              Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            {scoreTrendData.length > 0 ? (
              <ChartContainer
                config={scoreTrendConfig}
                className="h-[250px] w-[90vw] md:w-full -mx-8 "
              >
                <AreaChart data={scoreTrendData} className="">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "rgba(74, 113, 153, 0.1)" }}
                  />
                  <defs>
                    <linearGradient
                      id="scoreGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#4a7199" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#4a7199" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#4a7199"
                    strokeWidth={2}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                <p>No score data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interview Status Distribution */}
        <Card className="chart-card w-[calc(100vw-48px)] md:w-full bg-white border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <FiPieChart className="w-5 h-5 text-main" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusDistributionData.length > 0 ? (
              <ChartContainer
                config={statusConfig}
                className="h-[200px] w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400">
                <p>No interviews yet</p>
              </div>
            )}
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {statusDistributionData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="text-xs text-gray-600">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Distribution Bar Chart */}
        <Card
          ref={chartRef}
          className="chart-card w-[calc(100vw-48px)] md:w-full  bg-white border-gray-100"
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <FiTarget className="w-5 h-5 text-main" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedInterviews.length > 0 ? (
              <ChartContainer
                config={scoreDistributionConfig}
                className="h-[220px] w-[90vw] md:w-full -ml-8"
              >
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="range"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "rgba(74, 113, 153, 0.1)" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#4a7199"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-400">
                <p>No completed interviews yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Interviews */}
        <Card
          ref={interviewsRef}
          className="chart-card bg-white border-gray-100"
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <FiClock className="w-5 h-5 text-main" />
              Recent Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interviews.length > 0 ? (
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
                {interviews
                  .slice(-6)
                  .reverse()
                  .map((interview) => (
                    <Link key={interview.id} href={`/attempt/${interview.id}`}>
                      <div className="interview-item flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-default">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              interview.isCompleted
                                ? "bg-green-100 text-green-600"
                                : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            {interview.isCompleted ? (
                              <FiCheckCircle className="w-5 h-5" />
                            ) : (
                              <FiClock className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-black cursor-pointer">
                              Attempt #{interview.attempt}
                            </p>
                            <p className="text-xs font-medium">
                              {formatDate(interview.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {interview.isCompleted &&
                            interview.score !== null && (
                              <Badge
                                className={`${getScoreColor(interview.score)} text-white font-bold border-0`}
                              >
                                {interview.score}%
                              </Badge>
                            )}
                          {!interview.isCompleted && (
                            <Badge
                              variant="outline"
                              className="text-amber-600 border-amber-300"
                            >
                              In Progress
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">
                <p>No interviews yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidateProfile;
