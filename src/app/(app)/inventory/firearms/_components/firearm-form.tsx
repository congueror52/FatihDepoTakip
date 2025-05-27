'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Firearm } from "@/types/inventory";
import { DEPOT_LOCATIONS } from "@/types/inventory";
import { firearmFormSchema, firearmStatuses, type FirearmFormValues } from "./firearm-form-schema";
import { addFirearmAction, updateFirearmAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface FirearmFormProps {
  firearm?: Firearm; // Optional: for editing existing firearm
}

export function FirearmForm({ firearm }: FirearmFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues: Partial<FirearmFormValues> = firearm ? {
    ...firearm,
    purchaseDate: firearm.purchaseDate ? format(new Date(firearm.purchaseDate), 'yyyy-MM-dd') : undefined,
  } : {
    status: 'In Service',
    depotId: DEPOT_LOCATIONS[0].id,
  };
  
  const form = useForm<FirearmFormValues>({
    resolver: zodResolver(firearmFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: FirearmFormValues) {
    try {
      const firearmData: Omit<Firearm, 'id' | 'lastUpdated' | 'itemType' | 'maintenanceHistory'> & { id?: string } = {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
      };

      if (firearm) {
        await updateFirearmAction({ ...firearmData, id: firearm.id } as Firearm);
        toast({ title: "Success", description: "Firearm updated successfully." });
      } else {
        await addFirearmAction(firearmData as Omit<Firearm, 'id' | 'lastUpdated' | 'itemType' | 'maintenanceHistory'>);
        toast({ title: "Success", description: "Firearm added successfully." });
      }
      router.push("/inventory/firearms");
      router.refresh(); // To ensure the table data is up-to-date
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: `Failed to ${firearm ? 'update' : 'add'} firearm.` });
      console.error("Form submission error:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Firearm Name / Identifier</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Rifle #123, Primary Sidearm" {...field} />
                </FormControl>
                <FormDescription>A descriptive name for easy identification.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                  <Input placeholder="SN123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., M4A1, Glock 19 Gen5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="manufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturer (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Colt, Glock" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="caliber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caliber</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 5.56x45mm, 9mm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="depotId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Depot Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a depot" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DEPOT_LOCATIONS.map(depot => (
                      <SelectItem key={depot.id} value={depot.id}>{depot.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {firearmStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Purchase Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional notes about the firearm..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : (firearm ? "Update Firearm" : "Add Firearm")}
        </Button>
      </form>
    </Form>
  );
}
