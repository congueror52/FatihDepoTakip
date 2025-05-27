'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, PlusCircle, Trash2, CalendarIcon } from "lucide-react";
import { type DepotInventorySnapshot, type HistoricalUsageSnapshot, type UpcomingRequirementsSnapshot, DEPOT_LOCATIONS } from "@/types/inventory";
import { suggestRebalancing } from "@/lib/actions/inventory.actions";
import type { AiBalancingFormValues, UpcomingRequirementsFormValues } from "./ai-balancing-form-schema";
import { aiBalancingFormSchema, upcomingRequirementsSchema } from "./ai-balancing-form-schema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";


interface AiBalancingFormProps {
  initialDepotAInventory: DepotInventorySnapshot;
  initialDepotBInventory: DepotInventorySnapshot;
  initialHistoricalUsage: HistoricalUsageSnapshot;
}

export function AiBalancingForm({ 
  initialDepotAInventory, 
  initialDepotBInventory, 
  initialHistoricalUsage 
}: AiBalancingFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any | null>(null); // Adjust type based on actual AI output
  const [showUpcomingReqForm, setShowUpcomingReqForm] = useState(false);

  const form = useForm<AiBalancingFormValues>({
    resolver: zodResolver(aiBalancingFormSchema),
    defaultValues: {
      depotAInventory: JSON.stringify(initialDepotAInventory, null, 2),
      depotBInventory: JSON.stringify(initialDepotBInventory, null, 2),
      historicalUsageData: JSON.stringify(initialHistoricalUsage, null, 2),
      upcomingRequirements: undefined,
    },
  });
  
  const upcomingReqForm = useForm<UpcomingRequirementsFormValues>({
    resolver: zodResolver(upcomingRequirementsSchema),
    defaultValues: {
      description: "",
      requiredItems: [{ nameOrCaliber: "", quantity: 1, itemType: "ammunition" }],
      depotId: "any",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // 7 days from now
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: upcomingReqForm.control,
    name: "requiredItems",
  });

  useEffect(() => {
    // Pre-fill textareas when initial data changes
    form.setValue("depotAInventory", JSON.stringify(initialDepotAInventory, null, 2));
    form.setValue("depotBInventory", JSON.stringify(initialDepotBInventory, null, 2));
    form.setValue("historicalUsageData", JSON.stringify(initialHistoricalUsage, null, 2));
  }, [initialDepotAInventory, initialDepotBInventory, initialHistoricalUsage, form]);


  async function onUpcomingReqSubmit(data: UpcomingRequirementsFormValues) {
     form.setValue("upcomingRequirements", {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    } as UpcomingRequirementsSnapshot); // Type assertion needed due to date string diff
    toast({ title: "Success", description: "Upcoming requirements saved. Ready to submit for AI balancing." });
    setShowUpcomingReqForm(false);
  }

  async function onSubmit(data: AiBalancingFormValues) {
    setIsLoading(true);
    setAiSuggestion(null);
    try {
      const result = await suggestRebalancing(
        JSON.parse(data.depotAInventory) as DepotInventorySnapshot,
        JSON.parse(data.depotBInventory) as DepotInventorySnapshot,
        JSON.parse(data.historicalUsageData) as HistoricalUsageSnapshot,
        data.upcomingRequirements as UpcomingRequirementsSnapshot // Already in correct type or undefined
      );

      if (result.success) {
        setAiSuggestion(result.data);
        toast({ title: "AI Suggestion Received", description: "Review the rebalancing plan below." });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {!showUpcomingReqForm ? (
         <Button type="button" variant="outline" onClick={() => setShowUpcomingReqForm(true)} className="mb-4">
          Add/Edit Upcoming Requirements
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Requirements (Optional)</CardTitle>
            <CardDescription>Specify any known future needs for more accurate suggestions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...upcomingReqForm}>
              <form onSubmit={upcomingReqForm.handleSubmit(onUpcomingReqSubmit)} className="space-y-4">
                <FormField
                  control={upcomingReqForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Input placeholder="e.g., Large scale training exercise" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={upcomingReqForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                           <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={cn(!field.value && "text-muted-foreground")}>
                                  {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : undefined)} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={upcomingReqForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={cn(!field.value && "text-muted-foreground")}>
                                  {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : undefined)} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={upcomingReqForm.control}
                      name="depotId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specific Depot (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select depot or any" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="any">Any Depot</SelectItem>
                              {DEPOT_LOCATIONS.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                <div>
                  <FormLabel>Required Items</FormLabel>
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex items-end gap-2 mt-2 p-2 border rounded-md">
                       <FormField
                        control={upcomingReqForm.control}
                        name={`requiredItems.${index}.nameOrCaliber`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            {index === 0 && <FormLabel className="text-xs">Name/Caliber</FormLabel>}
                            <FormControl><Input placeholder="e.g., 5.56mm or M4 Rifle" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={upcomingReqForm.control}
                        name={`requiredItems.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            {index === 0 && <FormLabel className="text-xs">Quantity</FormLabel>}
                            <FormControl><Input type="number" placeholder="Qty" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={upcomingReqForm.control}
                        name={`requiredItems.${index}.itemType`}
                        render={({ field }) => (
                           <FormItem className="w-40">
                            {index === 0 && <FormLabel className="text-xs">Item Type</FormLabel>}
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="ammunition">Ammunition</SelectItem>
                                <SelectItem value="firearm">Firearm</SelectItem>
                                <SelectItem value="magazine">Magazine</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ nameOrCaliber: "", quantity: 1, itemType: "ammunition"})} className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save Requirements</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowUpcomingReqForm(false)}>Cancel</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="depotAInventory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Depot Alpha Inventory (JSON)</FormLabel>
                <FormControl><Textarea rows={8} {...field} /></FormControl>
                <FormDescription>Current inventory data for Depot Alpha in JSON format.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="depotBInventory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Depot Bravo Inventory (JSON)</FormLabel>
                <FormControl><Textarea rows={8} {...field} /></FormControl>
                <FormDescription>Current inventory data for Depot Bravo in JSON format.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="historicalUsageData"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Historical Usage Data (JSON)</FormLabel>
                <FormControl><Textarea rows={8} {...field} /></FormControl>
                <FormDescription>Historical usage data for both depots in JSON format.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
           {form.watch("upcomingRequirements") && (
            <Card className="bg-secondary/50">
              <CardHeader><CardTitle className="text-base">Upcoming Requirements Specified</CardTitle></CardHeader>
              <CardContent><pre className="text-xs whitespace-pre-wrap">{JSON.stringify(form.getValues("upcomingRequirements"), null, 2)}</pre></CardContent>
            </Card>
           )}

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Get AI Suggestion
          </Button>
        </form>
      </Form>

      {aiSuggestion && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>AI Rebalancing Suggestion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Reasoning:</h3>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md whitespace-pre-wrap">{aiSuggestion.reasoning}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Rebalancing Plan:</h3>
              <pre className="text-sm p-3 bg-muted/50 rounded-md whitespace-pre-wrap">
                {typeof aiSuggestion.rebalancingSuggestion === 'string' ? JSON.stringify(JSON.parse(aiSuggestion.rebalancingSuggestion), null, 2) : JSON.stringify(aiSuggestion.rebalancingSuggestion, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
