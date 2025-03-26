import { FileText, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceAddress } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface InvoiceAddressCardProps {
  address: InvoiceAddress;
  onEdit: (address: InvoiceAddress) => void;
  onDelete: (address: InvoiceAddress) => void;
}

export function InvoiceAddressCard({ address, onEdit, onDelete }: InvoiceAddressCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-primary/10">
      <CardHeader className="pb-2 bg-primary/5">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-primary" />
              Invoice Address
              {address.isDefault && (
                <Badge variant="default" className="ml-2">Default</Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
              {address.street}, {address.city}, {address.postalCode}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2 text-sm">
        <div className="space-y-2">
          {address.locationId && (
            <div className="mt-2">
              <Badge variant="outline">Linked to specific location</Badge>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(address)}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(address)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}