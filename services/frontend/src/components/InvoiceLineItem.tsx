import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

export interface LineItem {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
}

interface InvoiceLineItemProps {
    item: LineItem;
    onUpdate: (id: string, field: keyof LineItem, value: string | number) => void;
    onRemove: (id: string) => void;
    canRemove: boolean;
    lineTotal: number;
    disabled: boolean;
}

export const InvoiceLineItem = ({
    item,
    onUpdate,
    onRemove,
    canRemove,
    lineTotal,
    disabled
}: InvoiceLineItemProps) => {
    return (
        <div className="grid grid-cols-12 gap-4 items-center p-4 border border-border rounded-lg">
            {/* Item Name */}
            <div className="col-span-5">
                <Input
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => onUpdate(item.id, "name", e.target.value)}
                    required
                    disabled={disabled}
                />
            </div>

            {/* Quantity */}
            <div className="col-span-2">
                <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity || ""}
                    onChange={(e) => onUpdate(item.id, "quantity", parseFloat(e.target.value) || 0)}
                    min="0"
                    step="1"
                    required
                    disabled={disabled}
                />
            </div>

            {/* Unit Price */}
            <div className="col-span-2">
                <Input
                    type="number"
                    placeholder="Price"
                    value={item.unitPrice || ""}
                    onChange={(e) => onUpdate(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    required
                    disabled={disabled}
                />
            </div>

            {/* Line Total */}
            <div className="col-span-2">
                <div className="text-right font-semibold text-success">
                    ${lineTotal.toFixed(2)}
                </div>
            </div>

            {/* Remove Button */}
            <div className="col-span-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(item.id)}
                    disabled={!canRemove || disabled}
                    className="p-2"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};