"use client";

import { useEffect, useRef, useMemo } from "react";
import { IRecruiter } from "@/types/user";
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
  CartesianGrid,
  Line,
  LineChart,
} from "recharts";
import {
  FiBriefcase,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiLayers,
  FiUsers,
  FiTrendingUp,
  FiCalendar,
  FiPieChart,
} from "react-icons/fi";
import gsap from "gsap";

function formatJobType(type: string) {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface RecruiterProfileProps {
  data: IRecruiter;
}

const RecruiterProfile = ({ data }: RecruiterProfileProps) => {
  const { user, jobs, organizationName, organizationRole } = data;
  const statsRef = useRef<HTMLDivElement>(null);
  const jobsRef = useRef<HTMLDivElement>(null);

  const totalJobs = jobs.length;

  const jobTypeData = useMemo(() => {
    const typeCounts = jobs.reduce(
      (acc, job) => {
        acc[job.jobType] = (acc[job.jobType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const colors: Record<string, string> = {
      FULL_TIME: "#22c55e",
      PART_TIME: "#3b82f6",
      CONTRACT: "#f59e0b",
      INTERNSHIP: "#a855f7",
    };

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: formatJobType(type),
      value: count,
      fill: colors[type] || "#94a3b8",
    }));
  }, [jobs]);

  const uniqueLocations = useMemo(
    () => [...new Set(jobs.map((j) => j.location))].length,
    [jobs]
  );

  const allTechnologies = useMemo(
    () => jobs.flatMap((j) => j.technologies),
    [jobs]
  );

  const topTechnologies = useMemo(() => {
    const techCounts = allTechnologies.reduce(
      (acc, tech) => {
        acc[tech] = (acc[tech] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(techCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [allTechnologies]);

  // Jobs posted over time (by month)
  const jobsOverTimeData = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    jobs.forEach((job) => {
      const month = new Date(job.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    return Object.entries(monthCounts)
      .slice(-6)
      .map(([month, count]) => ({ month, jobs: count }));
  }, [jobs]);

  // Salary range data
  const salaryRangeData = useMemo(() => {
    if (jobs.length === 0) return [];
    return jobs.slice(-6).map((job) => ({
      role:
        job.jobRole.length > 15
          ? job.jobRole.slice(0, 15) + "..."
          : job.jobRole,
      min: job.salaryRange.min / 1000,
      max: job.salaryRange.max / 1000,
    }));
  }, [jobs]);

  // Chart configs
  const jobTypeConfig: ChartConfig = {
    fullTime: { label: "Full Time", color: "#22c55e" },
    partTime: { label: "Part Time", color: "#3b82f6" },
    contract: { label: "Contract", color: "#f59e0b" },
    internship: { label: "Internship", color: "#a855f7" },
  };

  const techConfig: ChartConfig = {
    count: { label: "Jobs", color: "#4a7199" },
  };

  const jobsTimeConfig: ChartConfig = {
    jobs: { label: "Jobs", color: "#4a7199" },
  };

  const formatSalary = (min: number, max: number) => {
    const formatK = (n: number) =>
      n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n;
    return `$${formatK(min)} - $${formatK(max)}`;
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "bg-green-100 text-green-700";
      case "PART_TIME":
        return "bg-blue-100 text-blue-700";
      case "CONTRACT":
        return "bg-amber-100 text-amber-700";
      case "INTERNSHIP":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
        ".job-item",
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

  const stats = [
    {
      icon: FiBriefcase,
      label: "Total Jobs",
      value: totalJobs,
      color: "text-main",
      bg: "bg-main/10",
    },
    {
      icon: FiUsers,
      label: "Job Types",
      value: Object.keys(jobTypeData).length,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: FiMapPin,
      label: "Locations",
      value: uniqueLocations,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: FiLayers,
      label: "Technologies",
      value: [...new Set(allTechnologies)].length,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div>
      <ProfileHeader
        user={user}
        organizationName={organizationName}
        organizationRole={organizationRole}
      />

      {/* Stats Grid */}
      <div
        ref={statsRef}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
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
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Job Type Distribution Pie Chart */}
        <Card className="chart-card bg-white border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <FiPieChart className="w-5 h-5 text-main" />
              Job Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobTypeData.length > 0 ? (
              <ChartContainer
                config={jobTypeConfig}
                className="h-[200px] w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={jobTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {jobTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400">
                <p>No jobs posted yet</p>
              </div>
            )}
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {jobTypeData.map((entry) => (
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

        {/* Top Technologies Bar Chart */}
        <Card className="chart-card lg:col-span-2 bg-white border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <FiTrendingUp className="w-5 h-5 text-main" />
              Top Technologies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topTechnologies.length > 0 ? (
              <ChartContainer config={techConfig} className="h-[250px] w-full">
                <BarChart data={topTechnologies} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    width={80}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "rgba(74, 113, 153, 0.1)" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#4a7199"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                <p>No technology data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Jobs Posted Over Time */}
        <Card className="chart-card bg-white border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <FiCalendar className="w-5 h-5 text-main" />
              Jobs Posted Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobsOverTimeData.length > 0 ? (
              <ChartContainer
                config={jobsTimeConfig}
                className="h-[200px] w-full"
              >
                <LineChart data={jobsOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: "#4a7199", strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="jobs"
                    stroke="#4a7199"
                    strokeWidth={2}
                    dot={{ fill: "#4a7199", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#4a7199" }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400">
                <p>No job posting data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Salary Ranges */}
        <Card className="chart-card bg-white border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <FiDollarSign className="w-5 h-5 text-main" />
              Salary Ranges (in $K)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salaryRangeData.length > 0 ? (
              <ChartContainer config={techConfig} className="h-[200px] w-full">
                <BarChart data={salaryRangeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="role"
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="min"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                    name="Min"
                  />
                  <Bar
                    dataKey="max"
                    fill="#4a7199"
                    radius={[4, 4, 0, 0]}
                    name="Max"
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400">
                <p>No salary data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Posted Jobs List */}
      <Card ref={jobsRef} className="chart-card bg-white border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
            <FiBriefcase className="w-5 h-5 text-main" />
            Posted Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {jobs
                .slice()
                .reverse()
                .map((job) => (
                  <div
                    key={job.id}
                    className="job-item p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-default"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {job.jobRole}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiMapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {job.experience}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={`${getJobTypeColor(job.jobType)} border-0 text-xs`}
                      >
                        {formatJobType(job.jobType)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                      <FiDollarSign className="w-3 h-3" />
                      {formatSalary(job.salaryRange.min, job.salaryRange.max)}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {job.technologies.slice(0, 4).map((tech, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs text-main border-main/30 bg-main/5"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {job.technologies.length > 4 && (
                        <Badge
                          variant="outline"
                          className="text-xs text-gray-500"
                        >
                          +{job.technologies.length - 4}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      Posted {formatDate(job.createdAt)}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <p>No jobs posted yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruiterProfile;
