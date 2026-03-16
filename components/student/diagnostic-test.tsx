"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  conceptId: string;
  difficultyLevel: string;
  questionText: string | null;
  options: QuestionOption[] | null;
  concept: { id: string; name: string };
}

interface Attempt {
  contentObjectId: string;
  conceptId: string;
  selectedOptionId: string;
  timeTakenSeconds: number;
}

export function DiagnosticTest() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/diagnostic/questions")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setQuestions(json.data);
        } else {
          setError(json.error ?? "Failed to load questions");
        }
      })
      .catch(() => setError("Network error — please refresh"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setSelected(null);
  }, [currentIndex]);

  function handleNext() {
    if (!selected || !questions[currentIndex]) return;

    const q = questions[currentIndex];
    const timeTakenSeconds = Math.floor((Date.now() - questionStartTime) / 1000);
    const newAttempts: Attempt[] = [
      ...attempts,
      {
        contentObjectId: q.id,
        conceptId: q.conceptId,
        selectedOptionId: selected,
        timeTakenSeconds,
      },
    ];
    setAttempts(newAttempts);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitDiagnostic(newAttempts);
    }
  }

  async function submitDiagnostic(finalAttempts: Attempt[]) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempts: finalAttempts }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Submission failed — please try again");
        setSubmitting(false);
        return;
      }
      router.push("/student/dashboard");
    } catch {
      setError("Network error — please try again");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading your diagnostic…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">No diagnostic questions available yet.</p>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Analysing your answers…</p>
      </div>
    );
  }

  const q = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <Badge variant="outline">{q.concept.name}</Badge>
          </div>
          <Progress value={progress} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium leading-relaxed">
              {q.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(q.options ?? []).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  selected === opt.id
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:bg-muted"
                }`}
              >
                <span className="mr-2 font-semibold uppercase">{opt.id}.</span>
                {opt.text}
              </button>
            ))}
          </CardContent>
        </Card>

        <Button className="w-full" disabled={!selected} onClick={handleNext}>
          {currentIndex + 1 === questions.length ? "Submit" : "Next"}
        </Button>
      </div>
    </main>
  );
}
