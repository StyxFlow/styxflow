"use client";

import { useState } from "react";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm, useWatch } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import { createJob } from "@/services/job";

const educationOptions = [
  "B.Sc. in Computer Science",
  "B.Sc. in Electrical Engineering",
  "B.Sc. in Mechanical Engineering",
  "B.Sc. in Civil Engineering",
  "B.Sc. in Software Engineering",
  "B.Sc. in Information Technology",
  "B.E. in Computer Engineering",
  "B.E. in Electronics Engineering",
  "B.Tech in Computer Science",
  "B.Tech in Information Technology",
  "M.Sc. in Computer Science",
  "M.Tech in Software Engineering",
  "MBA in Technology Management",
  "Any Engineering Degree",
  "Any Bachelor's Degree",
];

const formSchema = z.object({
  jobRole: z
    .string()
    .min(3, "Job role must be at least 3 characters")
    .max(100, "Job role must not exceed 100 characters"),
  jobDescription: z
    .string()
    .min(20, "Job description must be at least 20 characters")
    .max(2000, "Job description must not exceed 2000 characters"),
  vacancies: z
    .number()
    .min(1, "At least 1 vacancy is required")
    .max(1000, "Vacancies cannot exceed 1000"),
  technologies: z
    .array(z.string())
    .min(1, "At least one technology is required"),
  additionalSkills: z.array(z.string()).optional(),
  education: z.string().min(1, "Please select an education requirement"),
  jobExperience: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateJob = () => {
  const [techInput, setTechInput] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [searchEducation, setSearchEducation] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobRole: "",
      jobDescription: "",
      vacancies: 1,
      technologies: [],
      additionalSkills: [],
      education: "",
      jobExperience: undefined,
    },
  });

  const technologies = useWatch({
    control: form.control,
    name: "technologies",
    defaultValue: [],
  });
  const additionalSkills = useWatch({
    control: form.control,
    name: "additionalSkills",
    defaultValue: [],
  });

  const handleAddTechnology = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const values = techInput
        .split(",")
        .map((tech) => tech.trim())
        .filter((tech) => tech.length > 0);

      if (values.length > 0) {
        const currentTech = form.getValues("technologies");
        const newTech = [...currentTech, ...values].filter(
          (v, i, a) => a.indexOf(v) === i
        );
        form.setValue("technologies", newTech);
        setTechInput("");
      }
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const values = skillsInput
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      if (values.length > 0) {
        const currentSkills = form.getValues("additionalSkills") || [];
        const newSkills = [...currentSkills, ...values].filter(
          (v, i, a) => a.indexOf(v) === i
        );
        form.setValue("additionalSkills", newSkills);
        setSkillsInput("");
      }
    }
  };

  const removeTechnology = (tech: string) => {
    const updated = technologies.filter((t) => t !== tech);
    form.setValue("technologies", updated);
  };

  const removeSkill = (skill: string) => {
    const updated = (additionalSkills || []).filter((s) => s !== skill);
    form.setValue("additionalSkills", updated);
  };

  const onSubmit = async (data: FormValues) => {
    const result = await createJob(data);
    console.log(result);
    // Handle form submission here
  };

  const filteredEducation = educationOptions.filter((option) =>
    option.toLowerCase().includes(searchEducation.toLowerCase())
  );

  return (
    <Card className="w-full mt-24 mb-16  max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="text-3xl">Create Job Circular</CardTitle>
        <CardDescription>
          Fill in the details to post a new job opening
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Role */}
            <FormField
              control={form.control}
              name="jobRole"
              render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <FormLabel>Job Role *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Senior Software Engineer"
                      {...field}
                      className="transition-all duration-200 focus:scale-[1.01]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Description */}
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-left-2 duration-300 delay-75">
                  <FormLabel>Job Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the role, responsibilities, and requirements..."
                      className="min-h-32 transition-all duration-200 focus:scale-[1.01]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of the job position
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vacancies */}
            <FormField
              control={form.control}
              name="vacancies"
              render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-left-2 duration-300 delay-150">
                  <FormLabel>Number of Vacancies *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="transition-all duration-200 focus:scale-[1.01]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Technologies */}
            <FormField
              control={form.control}
              name="technologies"
              render={() => (
                <FormItem className="animate-in fade-in slide-in-from-left-2 duration-300 delay-200">
                  <FormLabel>Technologies Required *</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder="Type technologies separated by comma (e.g., React, Node.js, TypeScript)"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={handleAddTechnology}
                        className="transition-all duration-200 focus:scale-[1.01]"
                      />
                      {technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                          {technologies.map((tech, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-3 py-1 animate-in zoom-in duration-200"
                              style={{
                                animationDelay: `${index * 50}ms`,
                              }}
                            >
                              {tech}
                              <button
                                type="button"
                                onClick={() => removeTechnology(tech)}
                                className="ml-2 hover:text-destructive transition-colors"
                              >
                                <RxCross2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Press Enter or comma to add technology
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Skills */}
            <FormField
              control={form.control}
              name="additionalSkills"
              render={() => (
                <FormItem className="animate-in fade-in slide-in-from-left-2 duration-300 delay-300">
                  <FormLabel>Additional Skills (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder="Type skills separated by comma (e.g., Leadership, Communication)"
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        className="transition-all duration-200 focus:scale-[1.01]"
                      />
                      {additionalSkills && additionalSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                          {additionalSkills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="px-3 py-1 animate-in zoom-in duration-200"
                              style={{
                                animationDelay: `${index * 50}ms`,
                              }}
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="ml-2 hover:text-destructive transition-colors"
                              >
                                <RxCross2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Press Enter or comma to add skill
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Education */}
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-left-2 duration-300 delay-[350ms]">
                  <FormLabel>Education Requirement *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="transition-all duration-200 focus:scale-[1.01]">
                        <SelectValue placeholder="Select education requirement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Search education..."
                          value={searchEducation}
                          onChange={(e) => setSearchEducation(e.target.value)}
                          className="mb-2"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {filteredEducation.length > 0 ? (
                        filteredEducation.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className="cursor-pointer transition-colors"
                          >
                            {option}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No results found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Experience */}
            <FormField
              control={form.control}
              name="jobExperience"
              render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-left-2 duration-300 delay-[400ms]">
                  <FormLabel>Years of Experience (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 3"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      value={field.value ?? ""}
                      className="transition-all duration-200 focus:scale-[1.01]"
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty if experience is not required
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300 delay-[450ms] transition-all hover:scale-[1.02]"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Creating Job..."
                : "Create Job Circular"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateJob;
