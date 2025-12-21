/* ============================================
   Organizer Seats Page - Seat Management
   Visual seat map and management
   ============================================ */

"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Armchair, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrganizerHeader } from "@/components/organizer/header";
import { eventService, EventListItem,SeatDto  } from "@/lib/services/event.service";
import { useUser } from "@/hooks/use-user";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";





type SeatStatus = "available" | "reserved" | "occupied";

interface SeatOccupant {
  studentId: string;
  studentName: string;
  studentCode?: string;
  ticketCode: string;
  registeredAt: string;
  checkInTime?: string | null;
  ticketStatus: string;
}


interface SeatData {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
  seatId?: string;
  occupant?: SeatOccupant | null;
}

/* =======================
   COMPONENT
   ======================= */

export default function OrganizerSeatsPage() {
  const { user } = useUser();

  const [events, setEvents] = useState<EventListItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);

  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
const searchParams = useSearchParams();
const eventIdFromUrl = searchParams.get("eventId");
  /* =======================
     FETCH EVENTS (GIỮ NGUYÊN)
     ======================= */


  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.userId) return;

      try {
        setIsLoadingEvents(true);
        const response = await eventService.getAllEvents({
          organizerId: user.userId,
          pageNumber: 1,
          pageSize: 100,
        });

        if (response.success && response.data) {

          setEvents(response.data);
          if (response.data.length > 0 && !selectedEvent) {
            if (eventIdFromUrl) {
              setSelectedEvent(eventIdFromUrl);
            } else {
              setSelectedEvent(response.data[0].eventId);
            }

          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Không thể tải danh sách sự kiện.");
      } finally {
        setIsLoadingEvents(false);
      }
    };


    fetchEvents();
  }, [user?.userId]);

  /* =======================
     FETCH SEATS (THÊM 2 API, GIỮ FLOW)
     ======================= */


  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedEvent) {
        setSeats([]);
        return;
      }

      try {
        setIsLoadingSeats(true);

        // API 1: FULL seat map
        const seatMapRes = await eventService.getEventSeatMap(selectedEvent);

        // API 2: Check-in map (có occupant)
        const checkinMapRes = await eventService.getEventSeatCheckinMap(
          selectedEvent
        );

        if (!seatMapRes.success || !seatMapRes.data?.rows) {
          toast.error(seatMapRes.message || "Không thể tải danh sách ghế.");
          setSeats([]);
          return;
        }

        // Map seatId → occupant
        const occupantMap = new Map<
          string,
          { status: SeatStatus; occupant: SeatOccupant | null }
        >();

        if (checkinMapRes.success && checkinMapRes.data?.rows) {
          checkinMapRes.data.rows.forEach((row: any) => {
            row.seats.forEach((seat: any) => {
              occupantMap.set(seat.seatId, {
                status: seat.status,
                occupant: seat.occupant ?? null,
              });
            });
          });
        }

        const mappedSeats: SeatData[] = seatMapRes.data.rows.flatMap(
          (row: any) =>
            row.seats
              .map((seat: any) => {
                const match = seat.label.match(/^([A-Z]+)(\d+)$/);
                const extra = occupantMap.get(seat.seatId);

                return {
                  id: seat.seatId,
                  seatId: seat.seatId,
                  row: row.rowLabel,
                  number: match ? Number(match[2]) : 0,
                  status: extra?.status ?? seat.status,
                  occupant: extra?.occupant ?? null,
                };
              })
              .sort((a: SeatData, b: SeatData) => a.number - b.number)
        );

        mappedSeats.sort((a, b) =>
          a.row !== b.row ? a.row.localeCompare(b.row) : a.number - b.number
        );

        setSeats(mappedSeats);
      } catch (error) {
        console.error("Error fetching seats:", error);
        toast.error("Không thể tải danh sách ghế. Vui lòng thử lại.");
        setSeats([]);
      } finally {
        setIsLoadingSeats(false);
      }
    };

    fetchSeats();
  }, [selectedEvent]);

  /* =======================
     HELPERS (GIỮ NGUYÊN)
     ======================= */

  const seatCounts = seats.reduce(
    (acc, seat) => {
      acc[seat.status]++;
      return acc;
    },
    { available: 0, reserved: 0, occupied: 0 } as Record<SeatStatus, number>
  );

  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, SeatData[]>);

  const refreshSeats = () => {
    if (selectedEvent) {
      const currentEvent = selectedEvent;
      setSelectedEvent("");
      setTimeout(() => setSelectedEvent(currentEvent), 100);
    }
  };

  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case "available":
        return "bg-success/20 text-success hover:bg-success/30 border-success/30";
      case "reserved":
        return "bg-warning/20 text-warning hover:bg-warning/30 border-warning/30";
      case "occupied":
        return "bg-primary/20 text-primary hover:bg-primary/30 border-primary/30";
    }
  };

  const getStatusBadgeClass = (status: SeatStatus) => {
    switch (status) {
      case "available":
        return "bg-success/20 text-success border-success/30";
      case "reserved":
        return "bg-warning/20 text-warning border-warning/30";
      case "occupied":
        return "bg-primary/20 text-primary border-primary/30";
    }
  };

  /* =======================
     UI (GIỮ NGUYÊN)
     ======================= */

  return (
    <>
      <OrganizerHeader title="Seat Management" />

      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-end justify-between gap-4">
          <div className="w-64">
            <label className="text-sm font-medium mb-1 block">Event</label>

            {isLoadingEvents ? (
              <div className="flex items-center gap-2 p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading events...
                </span>
              </div>
            ) : (
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sự kiện" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.eventId} value={event.eventId}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Button
            variant="outline"
            onClick={refreshSeats}
            disabled={!selectedEvent || isLoadingSeats}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isLoadingSeats && "animate-spin")}
            />
            Refresh
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Seat Map */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Armchair className="h-4 w-4" />
                {selectedEvent
                  ? events.find((e) => e.eventId === selectedEvent)?.title
                  : "Seat Map"}
              </CardTitle>
              <CardDescription>Click vào ghế để xem chi tiết</CardDescription>
            </CardHeader>

            <CardContent className="pb-6">
              {isLoadingSeats ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="bg-muted rounded-lg p-3 text-center text-sm font-medium text-muted-foreground mb-6">
                    STAGE
                  </div>

                  <div className="space-y-2 overflow-x-auto pb-4">
                    {Object.entries(seatsByRow).map(([row, rowSeats]) => (
                      <div key={row} className="flex items-center gap-2">
                        <span className="w-6 text-sm font-medium text-muted-foreground flex-shrink-0">
                          {row}
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          {rowSeats.map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => setSelectedSeat(seat)}
                              className={cn(
                                "w-8 h-8 rounded text-xs font-medium border transition-colors flex-shrink-0",
                                getSeatColor(seat.status),
                                selectedSeat?.id === seat.id &&
                                  "ring-2 ring-ring"
                              )}
                              title={`${seat.row}${seat.number} - ${seat.status}`}
                            >
                              {seat.number}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-success/20 border border-success/30" />
                      <span className="text-xs">
                        Còn trống ({seatCounts.available})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30" />
                      <span className="text-xs">
                        Đã đặt  ({seatCounts.reserved})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30" />
                      <span className="text-xs">
                        Đã có người ngồi ({seatCounts.occupied})
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Seat Details Panel */}
          <div className="space-y-4 lg:col-span-1">
            {/* Seat Statistics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Thống kê chỗ ngồi</CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 pb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng chỗ ngồi </span>
                  <span className="font-medium">{seats.length}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Còn trống</span>
                  <span className="font-medium text-success">
                    {seatCounts.available}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Đã Đặt</span>
                  <span className="font-medium text-warning">
                    {seatCounts.reserved}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Đã có người ngồi
                  </span>
                  <span className="font-medium text-primary">
                    {seatCounts.occupied}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Chi tiết ghế</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 pb-6">
                {!selectedSeat ? (
                  <div className="text-center text-muted-foreground text-sm">
                    Chọn ghế để xem chi tiết
                  </div>
                ) : (
                  <>
                    <div className="text-center py-2">
                      <p className="text-2xl font-bold">
                        {selectedSeat.row}
                        {selectedSeat.number}
                      </p>

                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-1 capitalize",
                          getStatusBadgeClass(selectedSeat.status)
                        )}
                      >
                        {selectedSeat.status}
                      </Badge>
                    </div>

                    {selectedSeat.occupant && (
                      <div className="mt-4 space-y-2 text-sm border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Họ tên</span>
                          <span className="font-medium">
                            {selectedSeat.occupant.studentName}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mã SV</span>
                          <span>
                            {selectedSeat.occupant.studentCode || "N/A"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Check-in
                          </span>
                          <span>
                            {selectedSeat.occupant.checkInTime
                              ? "Đã check-in"
                              : "Chưa check-in"}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
