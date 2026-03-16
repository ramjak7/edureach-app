"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import {
  StudentRegistrationSchema,
  type StudentRegistrationInput,
} from "@/lib/validators/student";

export function OnboardingForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StudentRegistrationInput>({
    resolver: zodResolver(StudentRegistrationSchema),
  });

  async function onSubmit(data: StudentRegistrationInput) {
    setServerError(null);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      setServerError(json.error ?? "Something went wrong");
      return;
    }
    router.push("/student/diagnostic");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Tell us about yourself</CardTitle>
        <CardDescription>
          We&apos;ll personalise your learning path to your board and class.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="displayName">Your name</Label>
            <Input
              id="displayName"
              placeholder="e.g. Riya Sharma"
              {...register("displayName")}
            />
            {errors.displayName && (
              <p className="text-sm text-red-500">{errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="board">Board</Label>
            <Select
              onValueChange={(v) =>
                setValue("board", v as StudentRegistrationInput["board"])
              }
            >
              <SelectTrigger id="board">
                <SelectValue placeholder="Select your board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CBSE">CBSE</SelectItem>
                <SelectItem value="ICSE">ICSE</SelectItem>
                <SelectItem value="Maharashtra">Maharashtra State Board</SelectItem>
                <SelectItem value="UP_Board">UP Board</SelectItem>
              </SelectContent>
            </Select>
            {errors.board && (
              <p className="text-sm text-red-500">{errors.board.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="classYear">Class</Label>
            <Select onValueChange={(v) => setValue("classYear", Number(v))}>
              <SelectTrigger id="classYear">
                <SelectValue placeholder="Select your class" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 7 }, (_, i) => i + 6).map((cls) => (
                  <SelectItem key={cls} value={String(cls)}>
                    Class {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.classYear && (
              <p className="text-sm text-red-500">{errors.classYear.message}</p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
