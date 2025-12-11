import { getFlightPlanById, getFlightPlanImages } from "@/app/api/flight/flight-plan-service";
import { getSatellites } from "@/app/api/satellites/satellite-service";
import { getGroundStations } from "@/app/api/ground-stations/ground-station-service";
import { ArrowLeft, Download, MapPin, Calendar, HardDrive, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlightStatusBadge } from "@/components/FlightStatusBadge";
import { notFound } from "next/navigation";
import type { FlightPlanStatus } from "@/app/api/flight/types";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FlightPlanImagesPage({ params }: PageProps) {
  const { id } = await params;
  const flightPlanId = parseInt(id, 10);

  if (isNaN(flightPlanId)) {
    notFound();
  }

  const [flightPlan, images, satellites, groundStations] = await Promise.all([
    getFlightPlanById(flightPlanId),
    getFlightPlanImages(flightPlanId),
    getSatellites(),
    getGroundStations(),
  ]);

  if (!flightPlan) {
    notFound();
  }

  const satellite = satellites.find((s) => s.id === flightPlan.satId);
  const groundStation = groundStations.find((gs) => gs.id === flightPlan.gsId);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <Link href={`/platform/flight/${id}`}>
          <Button variant="ghost" className="w-fit -ml-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Flight Plan
          </Button>
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Captured Images</h1>
            <p className="text-muted-foreground mt-2">
              {flightPlan.name || `Flight Plan #${flightPlanId}`}
            </p>
          </div>
          <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-200">
            {images.length} {images.length === 1 ? "Image" : "Images"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Satellite</p>
              <p className="font-medium">{satellite?.name || `ID: ${flightPlan.satId}`}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ground Station</p>
              <p className="font-medium">{flightPlan.gsId == null ? "Deleted" : (groundStation?.name || `ID: ${flightPlan.gsId}`)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Status</p>
              <FlightStatusBadge status={flightPlan.status as FlightPlanStatus} />
            </div>
          </div>
        </CardContent>
      </Card>

      {images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Images Available</h3>
            <p className="text-muted-foreground text-center max-w-md">
              No images have been captured for this flight plan yet. Images will appear here once they are transmitted from the satellite.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.imageId} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.fileName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black/50 text-white hover:bg-black/70">
                    #{image.imageId}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-base line-clamp-1" title={image.fileName}>
                  {image.fileName}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {formatDate(image.captureTime)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-mono text-xs truncate" title={`${image.latitude.toFixed(3)}°, ${image.longitude.toFixed(3)}°`}>
                        {image.latitude.toFixed(3)}°
                      </p>
                      <p className="font-mono text-xs truncate" title={`${image.latitude.toFixed(3)}°, ${image.longitude.toFixed(3)}°`}>
                        {image.longitude.toFixed(3)}°
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Size</p>
                      <p className="font-medium truncate">{formatFileSize(image.fileSize)}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <a
                    href={image.url}
                    download={image.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </a>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Expires: {formatDate(image.expiresAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
