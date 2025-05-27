'use client';

import type { Firearm } from "@/types/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteFirearmAction } from "@/lib/actions/inventory.actions"; // Assuming this action exists

interface FirearmsTableClientProps {
  firearms: Firearm[];
}

export function FirearmsTableClient({ firearms: initialFirearms }: FirearmsTableClientProps) {
  const [firearms, setFirearms] = useState<Firearm[]>(initialFirearms);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFirearmId, setSelectedFirearmId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!selectedFirearmId) return;
    try {
      await deleteFirearmAction(selectedFirearmId);
      setFirearms(firearms.filter(f => f.id !== selectedFirearmId));
      toast({ title: "Success", description: "Firearm deleted successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete firearm." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedFirearmId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedFirearmId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const getStatusColor = (status: Firearm['status']) => {
    switch (status) {
      case 'In Service': return 'bg-green-500 hover:bg-green-600';
      case 'Under Maintenance': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Defective': return 'bg-red-500 hover:bg-red-600';
      case 'Awaiting Repair': return 'bg-orange-500 hover:bg-orange-600';
      case 'Repaired': return 'bg-blue-500 hover:bg-blue-600';
      case 'Out of Service': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-primary';
    }
  };


  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Serial Number</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Caliber</TableHead>
            <TableHead>Depot</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {firearms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">No firearms found.</TableCell>
            </TableRow>
          ) : (
            firearms.map((firearm) => (
              <TableRow key={firearm.id}>
                <TableCell className="font-medium">{firearm.serialNumber}</TableCell>
                <TableCell>{firearm.model}</TableCell>
                <TableCell>{firearm.caliber}</TableCell>
                <TableCell>{firearm.depotId === 'depotA' ? 'Depot Alpha' : 'Depot Bravo'}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`${getStatusColor(firearm.status)} text-primary-foreground`}>
                    {firearm.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(firearm.lastUpdated).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/inventory/firearms/${firearm.id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                         <Link href={`/inventory/firearms/${firearm.id}/edit`} className="flex items-center">
                           <Edit className="mr-2 h-4 w-4" /> Edit
                         </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openDeleteDialog(firearm.id)} className="text-destructive flex items-center">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the firearm
              and all related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
