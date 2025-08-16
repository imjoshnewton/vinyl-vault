"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2 } from "lucide-react";
import { updateRecordAction, deleteRecordAction } from "@/actions/records.actions";
import type { VinylRecord } from "@/server/db";

const recordSchema = z.object({
  artist: z.string().min(1, "Artist is required"),
  title: z.string().min(1, "Title is required"),
  label: z.string().optional(),
  catalogNumber: z.string().optional(),
  releaseYear: z.string().optional(),
  genre: z.string().optional(),
  type: z.enum(["LP", "Single", "EP"]),
  condition: z.enum([
    "Mint",
    "Near Mint", 
    "Very Good Plus",
    "Very Good",
    "Good Plus",
    "Good",
    "Fair",
    "Poor"
  ]),
  purchasePrice: z.string().optional(),
  notes: z.string().optional(),
});

type RecordFormData = z.infer<typeof recordSchema>;

interface EditRecordDialogProps {
  record: VinylRecord;
}

export default function EditRecordDialog({ record }: EditRecordDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      artist: record.artist,
      title: record.title,
      label: record.label || "",
      catalogNumber: record.catalogNumber || "",
      releaseYear: record.releaseYear?.toString() || "",
      genre: record.genre || "",
      type: record.type,
      condition: record.condition || "Very Good",
      purchasePrice: record.purchasePrice ? (record.purchasePrice / 100).toFixed(2) : "",
      notes: record.notes || "",
    },
  });

  // Reset form when record changes
  useEffect(() => {
    form.reset({
      artist: record.artist,
      title: record.title,
      label: record.label || "",
      catalogNumber: record.catalogNumber || "",
      releaseYear: record.releaseYear?.toString() || "",
      genre: record.genre || "",
      type: record.type,
      condition: record.condition || "Very Good",
      purchasePrice: record.purchasePrice ? (record.purchasePrice / 100).toFixed(2) : "",
      notes: record.notes || "",
    });
  }, [record, form]);

  const onSubmit = async (data: RecordFormData) => {
    setIsSubmitting(true);
    try {
      const updateData = {
        ...data,
        purchasePrice: data.purchasePrice ? Math.round(parseFloat(data.purchasePrice) * 100) : null,
        releaseYear: data.releaseYear ? parseInt(data.releaseYear) : null,
      };
      
      await updateRecordAction(record.id, updateData);
      setOpen(false);
    } catch (error) {
      console.error("Error updating record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteRecordAction(record.id);
      setOpen(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting record:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Edit className="w-3 h-3" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
        </DialogHeader>
        
        {!showDeleteConfirm ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="artist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artist *</FormLabel>
                      <FormControl>
                        <Input placeholder="Artist name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Album/Song title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LP">LP</SelectItem>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="EP">EP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mint">Mint</SelectItem>
                          <SelectItem value="Near Mint">Near Mint</SelectItem>
                          <SelectItem value="Very Good Plus">Very Good Plus</SelectItem>
                          <SelectItem value="Very Good">Very Good</SelectItem>
                          <SelectItem value="Good Plus">Good Plus</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                          <SelectItem value="Poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Record label" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="catalogNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catalog Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Catalog number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="releaseYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Release Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="YYYY" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <FormControl>
                        <Input placeholder="Genre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 order-2 sm:order-1"
                >
                  {isSubmitting ? "Updating..." : "Update Record"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="gap-2 order-1 sm:order-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="order-3"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">Delete Record</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete &quot;{record.title}&quot; by {record.artist}?
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}