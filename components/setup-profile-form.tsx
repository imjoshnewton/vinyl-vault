"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { updateUserProfileAction } from "@/actions/user.actions";
import type { User } from "@/server/db";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores")
    .toLowerCase(),
  isPublic: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface SetupProfileFormProps {
  user: User;
}

export default function SetupProfileForm({}: SetupProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const router = useRouter();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      isPublic: true,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setUsernameError("");
    
    try {
      await updateUserProfileAction(data);
      router.push(`/u/${data.username}`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("username")) {
          setUsernameError("This username is already taken. Please choose another.");
        } else {
          setUsernameError("An error occurred. Please try again.");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground mr-1">
                    vinylvault.app/u/
                  </span>
                  <Input 
                    placeholder="your-username" 
                    {...field}
                    className="flex-1"
                  />
                </div>
              </FormControl>
              <FormDescription>
                This will be your unique collection URL that you can share with friends.
              </FormDescription>
              <FormMessage />
              {usernameError && (
                <p className="text-sm text-destructive">{usernameError}</p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Make my collection public
                </FormLabel>
                <FormDescription>
                  Allow others to view your vinyl collection when they visit your link.
                  You can change this setting later.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Setting up..." : "Create Collection"}
        </Button>
      </form>
    </Form>
  );
}