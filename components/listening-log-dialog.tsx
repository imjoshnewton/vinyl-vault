"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Music, Heart, MapPin, Cloud, Users, Sparkles } from "lucide-react";
import type { VinylRecord } from "@/server/db";

const listeningLogSchema = z.object({
  notes: z.string().min(1, "Please add some notes about this listening session"),
  mood: z.string().optional(),
  location: z.string().optional(),
  weather: z.string().optional(),
  occasion: z.string().optional(),
  rating: z.string().optional(),
  favoriteTracks: z.string().optional(),
  guests: z.string().optional(),
  turntable: z.string().optional(),
  preClean: z.boolean().default(false),
});

type ListeningLogFormData = z.infer<typeof listeningLogSchema>;

interface ListeningLogDialogProps {
  record: VinylRecord;
  open: boolean;
  onClose: () => void;
}

export default function ListeningLogDialog({ 
  record, 
  open, 
  onClose 
}: ListeningLogDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ListeningLogFormData>({
    resolver: zodResolver(listeningLogSchema),
    defaultValues: {
      notes: "",
      mood: "",
      location: "",
      weather: "",
      occasion: "",
      rating: "",
      favoriteTracks: "",
      guests: "",
      turntable: "",
      preClean: false,
    },
  });

  const onSubmit = async (data: ListeningLogFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to save listening log
      console.log("Saving listening log:", {
        recordId: record.id,
        ...data,
        favoriteTracks: data.favoriteTracks?.split(",").map(t => t.trim()),
        guests: data.guests?.split(",").map(g => g.trim()),
        rating: data.rating ? parseInt(data.rating) : undefined,
      });
      
      // For now, just close the dialog
      setTimeout(() => {
        onClose();
        form.reset();
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error saving listening log:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Add Listening Note
          </DialogTitle>
          <DialogDescription>
            Document your listening session for {record.artist} - {record.title}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Main Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listening Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How did this album make you feel? Any standout moments? Memories it brought back?"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mood & Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Mood
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How are you feeling?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="relaxed">Relaxed</SelectItem>
                        <SelectItem value="energetic">Energetic</SelectItem>
                        <SelectItem value="nostalgic">Nostalgic</SelectItem>
                        <SelectItem value="contemplative">Contemplative</SelectItem>
                        <SelectItem value="happy">Happy</SelectItem>
                        <SelectItem value="melancholic">Melancholic</SelectItem>
                        <SelectItem value="focused">Focused</SelectItem>
                        <SelectItem value="romantic">Romantic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occasion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Occasion
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Sunday morning, dinner party, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Living room, studio, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weather"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Cloud className="w-4 h-4" />
                      Weather
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="What's it like outside?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sunny">Sunny</SelectItem>
                        <SelectItem value="cloudy">Cloudy</SelectItem>
                        <SelectItem value="rainy">Rainy</SelectItem>
                        <SelectItem value="snowy">Snowy</SelectItem>
                        <SelectItem value="stormy">Stormy</SelectItem>
                        <SelectItem value="foggy">Foggy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Session Details */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Rating</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Rate this listening session" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ Amazing</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ Great</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ Good</SelectItem>
                      <SelectItem value="2">⭐⭐ Okay</SelectItem>
                      <SelectItem value="1">⭐ Not feeling it</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="favoriteTracks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favorite Tracks</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Track names or numbers, separated by commas" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Which tracks stood out during this session?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Listening With
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Names of people listening with you" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Technical Details */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">Technical Details (Optional)</h3>
              
              <FormField
                control={form.control}
                name="turntable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gear Used</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Turntable, cartridge, etc." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preClean"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Cleaned before playing
                      </FormLabel>
                      <FormDescription>
                        Did you clean the record before this session?
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Saving..." : "Save Listening Note"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}