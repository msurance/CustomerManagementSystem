import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerLocation } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface LocationCardProps {
  location: CustomerLocation;
  onEdit: (location: CustomerLocation) => void;
  onDelete: (location: CustomerLocation) => void;
}

export function LocationCard({ location, onEdit, onDelete }: LocationCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-primary" />
              {location.name}
              {location.isMain && (
                <Badge variant="secondary" className="ml-2">Main Location</Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
              {location.street}, {location.city}, {location.postalCode}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2 text-sm">
        <div className="space-y-2">
          {location.email && (
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{location.email}</span>
            </div>
          )}
          {location.phone && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{location.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(location)}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(location)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}