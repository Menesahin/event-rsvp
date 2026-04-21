"use client";

import { useActionState, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";

interface Speaker {
  name: string;
  title: string;
  bio: string;
  avatar: string;
}

interface FormState {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

interface EventFormProps {
  action: (prevState: unknown, formData: FormData) => Promise<FormState>;
  defaultValues?: {
    title?: string;
    description?: string;
    date?: string;
    endDate?: string;
    location?: string;
    coverImage?: string;
    capacity?: number;
    speakers?: Speaker[];
  };
  isApproved?: boolean;
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-red-500">{errors[0]}</p>;
}

export function EventForm({ action, defaultValues, isApproved = false }: EventFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [speakers, setSpeakers] = useState<Speaker[]>(
    defaultValues?.speakers ?? [],
  );

  const fieldErrors = (state as FormState | null)?.fieldErrors;

  function addSpeaker() {
    setSpeakers([...speakers, { name: "", title: "", bio: "", avatar: "" }]);
  }

  useEffect(() => {
    if ((state as FormState | null)?.success) {
      toast.success("Changes saved");
    }
  }, [state]);

  function removeSpeaker(index: number) {
    setSpeakers(speakers.filter((_, i) => i !== index));
  }

  function updateSpeaker(index: number, field: keyof Speaker, value: string) {
    const updated = [...speakers];
    updated[index] = { ...updated[index], [field]: value };
    setSpeakers(updated);
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="speakers" value={JSON.stringify(speakers)} />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={defaultValues?.title}
            placeholder="Next.js Conf Istanbul 2026"
            required
            maxLength={120}
            disabled={isApproved}
            aria-invalid={!!fieldErrors?.title}
          />
          <FieldError errors={fieldErrors?.title} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={defaultValues?.description}
            placeholder="Describe your event..."
            required
            rows={5}
            aria-invalid={!!fieldErrors?.description}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-red-500"
          />
          <FieldError errors={fieldErrors?.description} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">Date & Time *</Label>
            <Input
              id="date"
              name="date"
              type="datetime-local"
              defaultValue={defaultValues?.date?.slice(0, 16)}
              required
              disabled={isApproved}
              aria-invalid={!!fieldErrors?.date}
            />
            <FieldError errors={fieldErrors?.date} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Time</Label>
            <Input
              id="endDate"
              name="endDate"
              type="datetime-local"
              defaultValue={defaultValues?.endDate?.slice(0, 16)}
              disabled={isApproved}
            />
            <FieldError errors={fieldErrors?.endDate} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            name="location"
            defaultValue={defaultValues?.location}
            placeholder="Istanbul Tech Hub, Levent"
            required
            disabled={isApproved}
            aria-invalid={!!fieldErrors?.location}
          />
          <FieldError errors={fieldErrors?.location} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              name="coverImage"
              defaultValue={defaultValues?.coverImage}
              placeholder="https://example.com/cover.jpg"
            />
            <FieldError errors={fieldErrors?.coverImage} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity *</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              max={10000}
              defaultValue={defaultValues?.capacity ?? 50}
              required
              disabled={isApproved}
              aria-invalid={!!fieldErrors?.capacity}
            />
            <FieldError errors={fieldErrors?.capacity} />
          </div>
        </div>
      </div>

      {/* Speakers */}
      {!isApproved && (
        <>
          <Separator />
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Speakers</h3>
              <Button type="button" variant="outline" size="sm" onClick={addSpeaker}>
                <Plus className="mr-1 h-4 w-4" />
                Add Speaker
              </Button>
            </div>

            <div className="space-y-4">
              {speakers.map((speaker, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                    <CardTitle className="text-sm">Speaker {index + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpeaker(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Name *"
                      aria-label={`Speaker ${index + 1} name`}
                      value={speaker.name}
                      onChange={(e) => updateSpeaker(index, "name", e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Title (e.g. Sr. Engineer)"
                      aria-label={`Speaker ${index + 1} title`}
                      value={speaker.title}
                      onChange={(e) => updateSpeaker(index, "title", e.target.value)}
                    />
                    <Input
                      placeholder="Bio"
                      aria-label={`Speaker ${index + 1} bio`}
                      value={speaker.bio}
                      onChange={(e) => updateSpeaker(index, "bio", e.target.value)}
                    />
                    <Input
                      placeholder="Avatar URL"
                      aria-label={`Speaker ${index + 1} avatar URL`}
                      value={speaker.avatar}
                      onChange={(e) => updateSpeaker(index, "avatar", e.target.value)}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {state?.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{state.error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} name="intent" value="draft">
          {isPending ? "Saving..." : defaultValues ? "Save Changes" : "Save Draft"}
        </Button>
        {!isApproved && (
          <Button type="submit" disabled={isPending} name="intent" value="submit" variant="secondary">
            Submit for Review
          </Button>
        )}
      </div>
    </form>
  );
}
