import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import type { Customer } from "@/data/types/Customer";

interface ClientComboboxProps {
    selectedClient: Customer | null;
    onClientSelect: (client: Customer | null) => void;
    disabled?: boolean;
}

// Mock API call - replace with real API
const fetchClients = async (): Promise<Customer[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
        { _id: "1", name: "Acme Corporation", email: "billing@acme.com" },
        { _id: "2", name: "TechStart Inc", email: "accounts@techstart.com" },
        { _id: "3", name: "Global Solutions Ltd", email: "finance@globalsolutions.com" },
        { _id: "4", name: "Innovative Designs", email: "admin@innovativedesigns.com" },
        { _id: "5", name: "Future Systems", email: "billing@futuresystems.com" },
    ];
};

export const ClientCombobox = ({ selectedClient, onClientSelect, disabled = false }: ClientComboboxProps) => {
    const [open, setOpen] = useState(false);
    const [clients, setClients] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadClients = async () => {
            setLoading(true);
            try {
                const clientData = await fetchClients();
                setClients(clientData);
            } catch (error) {
                console.error("Failed to fetch clients:", error);
            } finally {
                setLoading(false);
            }
        };

        loadClients();
    }, []);

    return (
        <Popover open={open} onOpenChange={disabled? undefined: setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                >
                    {selectedClient ? (
                        <div className="flex flex-col items-start">
                            <span className="font-medium">{selectedClient.name}</span>
                            <span className="text-sm text-muted-foreground">{selectedClient.email}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Select client...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search clients..." />
                    <CommandList>
                        <CommandEmpty>
                            {loading ? "Loading clients..." : "No clients found."}
                        </CommandEmpty>
                        <CommandGroup>
                            {clients.map((client) => (
                                <CommandItem
                                    key={client._id}
                                    value={client.name}
                                    onSelect={() => {
                                        onClientSelect(selectedClient?._id === client._id ? null : client);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedClient?._id === client._id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{client.name}</span>
                                        <span className="text-sm text-muted-foreground">{client.email}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};