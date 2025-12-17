/* ============================================
   Staff Check-in Portal - Enhanced
   Full check-in interface with event details and stats
   ============================================ */

   "use client";

   import { useState, useEffect, useCallback } from "react";
   import { useParams } from "next/navigation";
   import Link from "next/link";
   import { toast } from "react-toastify";
   import {
     QrCode,
     CheckCircle,
     XCircle,
     AlertCircle,
     ArrowLeft,
     Calendar,
     Clock,
     MapPin,
     Users,
     Mic,
     RefreshCw,
     Camera,
     Loader2,
   } from "lucide-react";
   import { Button } from "@/components/ui/button";
   import { Input } from "@/components/ui/input";
   import {
     Card,
     CardContent,
     CardHeader,
     CardTitle,
     CardDescription,
   } from "@/components/ui/card";
   import { Badge } from "@/components/ui/badge";
   import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
   } from "@/components/ui/table";
   import { Progress } from "@/components/ui/progress";
   import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
   import { QRScanner } from "@/components/staff/qr-scanner";
   import { eventService, EventDetailDto } from "@/lib/services/event.service";
   import {
     checkInService,
     CheckInRecord,
     CheckInStats,
   } from "@/lib/services/checkin.service";
   import { ticketService } from "@/lib/services/ticket.service";
   
   // Check-in result interface
   interface CheckInResult {
     status:
       | "entered"
       | "already_used"
       | "checked_out"
       | "not_found"
       | "cancelled"
       | "expired";
     message: string;
     attendeeName?: string;
     ticketCode?: string;
     time?: string;
     seatInfo?: string;
   }
   
   export default function StaffCheckInPage() {
     const params = useParams();
     const eventId = params.eventId as string;
   
     const [ticketCode, setTicketCode] = useState("");
     const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(
       null
     );
     type ActionMode = "checkin" | "checkout";
     const [mode, setMode] = useState<ActionMode>("checkin");
     const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>([]);
     const [isProcessing, setIsProcessing] = useState(false);
     const [isLoading, setIsLoading] = useState(true);
     const [showQRScanner, setShowQRScanner] = useState(false);
     const [event, setEvent] = useState<EventDetailDto | null>(null);
     const [stats, setStats] = useState<CheckInStats>({
       checkedIn: 0,
       totalRegistered: 0,
       checkInRate: 0,
     });
   
     // Fetch event data
     useEffect(() => {
       const fetchEvent = async () => {
         try {
           setIsLoading(true);
           const response = await eventService.getEventById(eventId);
           if (response.success && response.data) {
             setEvent(response.data);
           } else {
             toast.error("Không tìm thấy sự kiện");
           }
         } catch (error: any) {
           console.error("Error fetching event:", error);
           toast.error("Không thể tải thông tin sự kiện");
         } finally {
           setIsLoading(false);
         }
       };
   
       if (eventId) {
         fetchEvent();
       }
     }, [eventId]);
   
     // Fetch check-in stats and records from statistics API
     useEffect(() => {
       const fetchData = async () => {
         if (!eventId) return;
   
         try {
           // Fetch statistics from API
           const statisticsResponse = await eventService.getEventStatistics(
             eventId
           );
   
           if (statisticsResponse.success && statisticsResponse.data) {
             const data = statisticsResponse.data;
   
             // Update stats
             setStats({
               checkedIn: data.checkedInCount || 0,
               totalRegistered: data.registeredCount || 0,
               checkInRate: data.checkInRate || 0,
             });
   
             // Update recent check-ins
             if (data.recentCheckIns && data.recentCheckIns.length > 0) {
               const checkIns: CheckInRecord[] = data.recentCheckIns.map((ci) => ({
                 id: ci.ticketCode, // Use ticketCode as ID
                 attendeeName: ci.attendeeName,
                 ticketCode: ci.ticketCode,
                 checkInTime: new Date(ci.checkInTime).toLocaleTimeString(
                   "vi-VN",
                   {
                     hour: "2-digit",
                     minute: "2-digit",
                   }
                 ),
                 status:
                   ci.status === "checked_out"
                     ? "checked_out"
                     : ci.status === "checked_in"
                     ? "entered"
                     : "already_used",
                 seatInfo: ci.seatNumber || undefined,
               }));
               setRecentCheckIns(checkIns);
             } else {
               setRecentCheckIns([]);
             }
   
             // Update event data if needed
             if (!event && data) {
               setEvent({
                 eventId: data.eventId,
                 title: data.title,
                 description: data.description,
                 date: data.date,
                 startTime: data.startTime,
                 endTime: data.endTime,
                 location: data.location,
                 imageUrl: data.imageUrl,
                 status: data.status,
                 totalSeats: data.totalSeats,
                 registeredCount: data.registeredCount,
               } as EventDetailDto);
             }
           } else {
             // Fallback to event stats if API not available
             if (event) {
               setStats({
                 checkedIn: event.registeredCount || 0,
                 totalRegistered: event.totalSeats || 0,
                 checkInRate:
                   event.totalSeats > 0
                     ? Math.round(
                         ((event.registeredCount || 0) / event.totalSeats) * 100
                       )
                     : 0,
               });
             }
           }
         } catch (error: any) {
           // Only log non-404 errors
           if (error?.response?.status !== 404) {
             console.error("Error fetching statistics:", error);
           }
           // Fallback to event stats if API not available
           if (event) {
             setStats({
               checkedIn: event.registeredCount || 0,
               totalRegistered: event.totalSeats || 0,
               checkInRate:
                 event.totalSeats > 0
                   ? Math.round(
                       ((event.registeredCount || 0) / event.totalSeats) * 100
                     )
                   : 0,
             });
           }
         }
       };
   
       if (eventId) {
         fetchData();
         // Refresh every 5 seconds
         const interval = setInterval(fetchData, 5000);
         return () => clearInterval(interval);
       }
     }, [eventId, event]);
     const handleCheckout = useCallback(
       async (code?: string) => {
         const codeToCheck = code || ticketCode.trim();
         if (!codeToCheck || isProcessing) return;
   
         setIsProcessing(true);
         setCheckInResult(null);
   
         try {
           await ticketService.checkoutByCode(codeToCheck);
   
           setCheckInResult({
             status: "checked_out",
             message: "Check-out thành công",
             ticketCode: codeToCheck,
           });
   
           setTicketCode("");
           toast.success("Check-out thành công!");
         } catch (error: any) {
           const msg =
             error?.response?.data?.message ||
             error?.message ||
             "Không thể check-out vé này";
   
           setCheckInResult({
             status: "already_used",
             message: msg,
             ticketCode: codeToCheck,
           });
   
           toast.error(msg);
         } finally {
           setIsProcessing(false);
           setTimeout(() => setCheckInResult(null), 5000);
         }
       },
       [ticketCode, isProcessing]
     );
   
     // Handle check-in
     const handleCheckIn = useCallback(
       async (code?: string) => {
         const codeToCheck = code || ticketCode.trim();
         if (!codeToCheck || isProcessing) return;
   
         setIsProcessing(true);
         setCheckInResult(null);
   
         try {
           const response = await checkInService.checkIn(codeToCheck);
   
           if (response.success) {
             // Success
             const result: CheckInResult = {
               status: "entered",
               message: response.message || "Check-in thành công!",
               ticketCode: codeToCheck,
             };
   
             // Try to get ticket details for more info
             try {
               const ticketResponse = await ticketService.getTicketByCode(
                 codeToCheck
               );
               if (ticketResponse.success && ticketResponse.data) {
                 result.attendeeName = ticketResponse.data.studentId; // You might want to fetch student name
                 result.seatInfo = ticketResponse.data.seatNumber || undefined;
               }
             } catch (err) {
               // Ignore if can't get ticket details
             }
   
             setCheckInResult(result);
             setTicketCode("");
   
             // Refresh statistics from API
             try {
               const statisticsResponse = await eventService.getEventStatistics(
                 eventId
               );
               if (statisticsResponse.success && statisticsResponse.data) {
                 const data = statisticsResponse.data;
   
                 // Update stats
                 setStats({
                   checkedIn: data.checkedInCount || 0,
                   totalRegistered: data.registeredCount || 0,
                   checkInRate: data.checkInRate || 0,
                 });
   
                 // Update recent check-ins
                 if (data.recentCheckIns && data.recentCheckIns.length > 0) {
                   const checkIns: CheckInRecord[] = data.recentCheckIns.map(
                     (ci) => ({
                       id: ci.ticketCode,
                       attendeeName: ci.attendeeName,
                       ticketCode: ci.ticketCode,
                       checkInTime: new Date(ci.checkInTime).toLocaleTimeString(
                         "vi-VN",
                         {
                           hour: "2-digit",
                           minute: "2-digit",
                         }
                       ),
                       status:
                         ci.status === "used" || ci.status === "checked_in"
                           ? "entered"
                           : "already_used",
                       seatInfo: ci.seatNumber || undefined,
                     })
                   );
                   setRecentCheckIns(checkIns);
                 }
               }
             } catch (error) {
               console.error("Error refreshing statistics:", error);
             }
   
             toast.success("Check-in thành công!");
           } else {
             // Handle different error types
             let status: CheckInResult["status"] = "not_found";
             let message = response.message || "Check-in thất bại";
   
             if (
               message.includes("Already Checked In") ||
               message.includes("đã được sử dụng")
             ) {
               status = "already_used";
               message = "Vé đã được check-in";
             } else if (message.includes("Cancelled") || message.includes("hủy")) {
               status = "cancelled";
               message = "Vé đã bị hủy";
             } else if (
               message.includes("Not Found") ||
               message.includes("không tìm thấy")
             ) {
               status = "not_found";
               message = "Không tìm thấy vé";
             }
   
             setCheckInResult({
               status,
               message,
               ticketCode: codeToCheck,
             });
   
             toast.error(message);
           }
         } catch (error: any) {
           console.error("Error checking in:", error);
           const errorMessage =
             error?.response?.data?.message ||
             error?.message ||
             "Có lỗi xảy ra khi check-in";
   
           let status: CheckInResult["status"] = "not_found";
           if (errorMessage.includes("Already") || errorMessage.includes("đã")) {
             status = "already_used";
           } else if (
             errorMessage.includes("Cancelled") ||
             errorMessage.includes("hủy")
           ) {
             status = "cancelled";
           }
   
           setCheckInResult({
             status,
             message: errorMessage,
             ticketCode: codeToCheck,
           });
   
           toast.error(errorMessage);
         } finally {
           setIsProcessing(false);
           // Clear result after 5 seconds
           setTimeout(() => setCheckInResult(null), 5000);
         }
       },
       [ticketCode, isProcessing, eventId]
     );
   
     // Handle QR scan success
     const handleQRScanSuccess = (decodedText: string) => {
       setShowQRScanner(false);
       mode === "checkin"
         ? handleCheckIn(decodedText)
         : handleCheckout(decodedText);
     };
   
     // Handle Enter key
     useEffect(() => {
       const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === "Enter" && ticketCode.trim() && !isProcessing) {
           mode === "checkin" ? handleCheckIn() : handleCheckout();
         }
       };
       window.addEventListener("keydown", handleKeyDown);
       return () => window.removeEventListener("keydown", handleKeyDown);
     }, [ticketCode, handleCheckIn, handleCheckout, mode, isProcessing]);
   
     if (isLoading) {
       return (
         <div className="flex flex-col items-center justify-center h-64 gap-4">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="text-muted-foreground">Đang tải...</p>
         </div>
       );
     }
   
     if (!event) {
       return (
         <div className="flex flex-col items-center justify-center h-64 gap-4">
           <p className="text-muted-foreground">Không tìm thấy sự kiện</p>
           <Link href="/staff">
             <Button variant="outline">
               <ArrowLeft className="h-4 w-4 mr-2" />
               Quay lại
             </Button>
           </Link>
         </div>
       );
     }
   
     const formatDate = (dateStr: string) => {
       const date = new Date(dateStr);
       return date.toLocaleDateString("vi-VN", {
         day: "2-digit",
         month: "2-digit",
         year: "numeric",
       });
     };
   
     const formatTime = (timeStr: string) => {
       return timeStr.substring(0, 5); // HH:mm
     };
   
     // Check if event is currently ongoing
     const isEventOngoing = () => {
       if (!event) return false;
   
       const now = new Date();
       const eventStart = new Date(`${event.date}T${event.startTime}`);
       const eventEnd = event.endTime
         ? new Date(`${event.date}T${event.endTime}`)
         : new Date(eventStart.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours if no endTime
   
       return now >= eventStart && now <= eventEnd;
     };
   
     return (
       <>
         <div className="space-y-4 max-w-7xl mx-auto p-4 lg:p-6">
           {/* Back Button & Title */}
           <div className="flex items-center gap-4">
             <Link href="/staff">
               <Button variant="ghost" size="sm" className="h-8">
                 <ArrowLeft className="h-4 w-4 mr-1" />
                 Quay lại
               </Button>
             </Link>
             <div>
               <h1 className="text-xl font-bold text-foreground">
                 Staff Check-in Portal
               </h1>
               <p className="text-xs text-muted-foreground">
                 {mode === "checkin"
                   ? "Nhập mã vé hoặc quét QR code để check-in"
                   : "Quét QR code của sinh viên để check-out"}
               </p>
             </div>
           </div>
   
           {/* Event Info Banner */}
           <Card className="bg-gradient-to-r from-primary/5 to-accent/10">
             <CardContent className="p-4">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                 {/* Event Details */}
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2">
                     <Badge variant={isEventOngoing() ? "default" : "secondary"}>
                       {isEventOngoing()
                         ? "Đang diễn ra"
                         : event.status === "published"
                         ? "Sắp diễn ra "
                         : event.status}
                     </Badge>
                     <h2 className="text-lg font-semibold">{event.title}</h2>
                   </div>
                   <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                     <span className="flex items-center gap-1">
                       <Calendar className="h-4 w-4" />
                       {formatDate(event.date)}
                     </span>
                     <span className="flex items-center gap-1">
                       <Clock className="h-4 w-4" />
                       {formatTime(event.startTime)}
                     </span>
                     <span className="flex items-center gap-1">
                       <MapPin className="h-4 w-4" />
                       {event.location || "Chưa có địa điểm"}
                     </span>
                     {event.totalSeats > 0 && (
                       <span className="flex items-center gap-1">
                         <Users className="h-4 w-4" />
                         Sức chứa: {event.totalSeats}
                       </span>
                     )}
                   </div>
                 </div>
   
                 {/* Quick Stats */}
                 <div className="flex gap-4">
                   <div className="text-center px-4 py-2 bg-background/80 rounded-lg">
                     <p className="text-2xl font-bold text-primary">
                       {stats.checkedIn}
                     </p>
                     <p className="text-xs text-muted-foreground">Đã check-in</p>
                   </div>
                   <div className="text-center px-4 py-2 bg-background/80 rounded-lg">
                     <p className="text-2xl font-bold">{stats.totalRegistered}</p>
                     <p className="text-xs text-muted-foreground">Đã đăng ký</p>
                   </div>
                   <div className="text-center px-4 py-2 bg-background/80 rounded-lg">
                     <p className="text-2xl font-bold text-success">
                       {stats.checkInRate}%
                     </p>
                     <p className="text-xs text-muted-foreground">Tỷ lệ</p>
                   </div>
                 </div>
               </div>
   
               {/* Progress Bar */}
               <div className="mt-4">
                 <div className="flex justify-between text-xs text-muted-foreground mb-1">
                   <span>Tiến độ check-in</span>
                   <span>
                     {stats.checkedIn} / {stats.totalRegistered}
                   </span>
                 </div>
                 <Progress value={stats.checkInRate} className="h-2" />
               </div>
             </CardContent>
           </Card>
   
           <div className="grid lg:grid-cols-3 gap-4">
             {/* Left Column - Check-in Interface */}
             <div className="space-y-4">
               {/* Ticket Input Card */}
               <Card>
                 <CardHeader className="pb-3">
                   <CardTitle className="text-base">Nhập mã vé</CardTitle>
                   <CardDescription className="text-xs">
                     Quét QR code hoặc nhập mã vé thủ công
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <div className="flex gap-2 mb-2">
                     <Button
                       size="sm"
                       variant={mode === "checkin" ? "default" : "outline"}
                       onClick={() => setMode("checkin")}
                     >
                       Check-in
                     </Button>
   
                     <Button
                       size="sm"
                       variant={mode === "checkout" ? "default" : "outline"}
                       onClick={() => setMode("checkout")}
                       disabled={!isEventOngoing()}
                     >
                       Check-out
                     </Button>
                   </div>
   
                   <Input
                     placeholder={
                       mode === "checkin"
                         ? "Quét hoặc nhập mã vé để check-in..."
                         : "Quét hoặc nhập mã vé để check-out..."
                     }
                     value={ticketCode}
                     onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                     className="text-lg h-12 font-mono text-center"
                     autoFocus
                     disabled={isProcessing}
                   />
                   <div className="flex gap-2">
                     <Button
                       onClick={() => setShowQRScanner(true)}
                       variant="outline"
                       className="flex-1"
                       disabled={isProcessing}
                     >
                       <Camera className="h-4 w-4 mr-2" />
                       Quét QR
                     </Button>
                     <Button
                       onClick={() =>
                         mode === "checkin" ? handleCheckIn() : handleCheckout()
                       }
                       className="flex-1 rounded-full h-11 mb-5"
                       disabled={!ticketCode.trim() || isProcessing}
                     >
                       {isProcessing ? (
                         <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                       ) : (
                         <QrCode className="h-4 w-4 mr-2" />
                       )}
                       {isProcessing
                         ? "Đang xử lý..."
                         : mode === "checkin"
                         ? "Check-in"
                         : "Check-out"}
                     </Button>
                   </div>
                 </CardContent>
               </Card>
   
               {/* Check-in Status Card */}
               <Card>
                 <CardHeader>
                   <CardTitle className="text-base">
                     {mode === "checkin"
                       ? "Trạng thái check-in"
                       : "Trạng thái check-out"}
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   {checkInResult ? (
                     <CheckInStatusCard result={checkInResult} />
                   ) : (
                     <div className="text-center py-4 mb-5 text-muted-foreground text-sm">
                       Nhập mã vé để check-in
                     </div>
                   )}
                 </CardContent>
               </Card>
   
               {/* Status Legend */}
               <Card>
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm">Chú giải trạng thái</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-2 mb-5">
                   <StatusLegendItem
                     status="entered"
                     label="Thành công / Đã vào"
                   />
                   <StatusLegendItem status="already_used" label="Đã check-in" />
                   <StatusLegendItem
                     status="not_found"
                     label="Không tìm thấy vé"
                   />
                   <StatusLegendItem status="cancelled" label="Vé đã hủy" />
                 </CardContent>
               </Card>
             </div>
   
             {/* Right Column - Recent Check-ins Table */}
             <Card className="lg:col-span-2">
               <CardHeader className="pb-3">
                 <div className="flex items-center justify-between">
                   <div>
                     <CardTitle className="text-base">Check-in gần đây</CardTitle>
                     <CardDescription className="text-xs">
                       Danh sách các lượt check-in mới nhất
                     </CardDescription>
                   </div>
                   <Badge variant="outline" className="text-xs">
                     {recentCheckIns.length} bản ghi
                   </Badge>
                 </div>
               </CardHeader>
               <CardContent>
                 {recentCheckIns.length === 0 ? (
                   <div className="text-center py-8 text-muted-foreground text-sm">
                     Chưa có lượt check-in nào
                   </div>
                 ) : (
                   <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead className="text-xs">
                           TÊN NGƯỜI THAM GIA
                         </TableHead>
                         <TableHead className="text-xs">MÃ VÉ</TableHead>
                         <TableHead className="text-xs">GHẾ</TableHead>
                         <TableHead className="text-xs">THỜI GIAN</TableHead>
                         <TableHead className="text-xs">TRẠNG THÁI</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {recentCheckIns.map((record, index) => (
                         <TableRow
                           key={record.id}
                           className={
                             index === 0 && checkInResult?.status === "entered"
                               ? "bg-success/5"
                               : ""
                           }
                         >
                           <TableCell className="font-medium text-sm py-2">
                             {record.attendeeName}
                           </TableCell>
                           <TableCell className="text-muted-foreground text-sm py-2 font-mono">
                             {record.ticketCode}
                           </TableCell>
                           <TableCell className="text-sm py-2">
                             {record.seatInfo || "-"}
                           </TableCell>
                           <TableCell className="text-sm py-2">
                             {record.checkInTime}
                           </TableCell>
                           <TableCell className="py-2">
                             <StatusBadge status={record.status} />
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 )}
               </CardContent>
             </Card>
           </div>
         </div>
   
         {/* QR Scanner Modal */}
         {showQRScanner && (
           <QRScanner
             onScanSuccess={handleQRScanSuccess}
             onClose={() => setShowQRScanner(false)}
           />
         )}
       </>
     );
   }
   
   // Check-in Status Card Component
   function CheckInStatusCard({ result }: { result: CheckInResult }) {
     const getStatusConfig = () => {
       switch (result.status) {
         case "entered":
           return {
             bgColor: "bg-success/10 border-success/30",
             textColor: "text-success",
             icon: <CheckCircle className="h-8 w-8" />,
           };
         case "checked_out":
           return {
             bgColor: "bg-blue-50 border-blue-300",
             textColor: "text-blue-600",
             icon: <CheckCircle className="h-8 w-8" />,
           };
         case "already_used":
           return {
             bgColor: "bg-warning/10 border-warning/30",
             textColor: "text-warning",
             icon: <AlertCircle className="h-8 w-8" />,
           };
         case "not_found":
         case "cancelled":
         case "expired":
           return {
             bgColor: "bg-destructive/10 border-destructive/30",
             textColor: "text-destructive",
             icon: <XCircle className="h-8 w-8" />,
           };
         default:
           return {
             bgColor: "bg-muted",
             textColor: "text-muted-foreground",
             icon: null,
           };
       }
     };
   
     const config = getStatusConfig();
   
     return (
       <div className={`p-4 rounded-lg border ${config.bgColor} text-center`}>
         <div className={`flex justify-center mb-2 ${config.textColor}`}>
           {config.icon}
         </div>
         <p className={`font-semibold text-lg ${config.textColor}`}>
           {result.message}
         </p>
         {result.attendeeName && (
           <p className="text-sm text-muted-foreground mt-1">
             {result.status === "entered"
               ? `Chào mừng, ${result.attendeeName}!`
               : `${result.attendeeName} - ${result.time}`}
           </p>
         )}
         {result.seatInfo && (
           <p className="text-sm font-medium mt-1">Ghế: {result.seatInfo}</p>
         )}
         {result.status === "not_found" && (
           <p className="text-sm text-muted-foreground mt-1">
             Mã &apos;{result.ticketCode}&apos; không tồn tại
           </p>
         )}
       </div>
     );
   }
   
   // Status Badge Component
   function StatusBadge({ status }: { status: CheckInRecord["status"] }) {
     const config = {
       entered: { label: "Đã vào", className: "bg-success/10 text-success" },
       checked_out: { label: "Đã ra", className: "bg-blue-50 text-blue-600" },
       already_used: {
         label: "Đã sử dụng",
         className: "bg-warning/10 text-warning",
       },
       not_found: {
         label: "Không tìm thấy",
         className: "bg-destructive/10 text-destructive",
       },
       cancelled: {
         label: "Đã hủy",
         className: "bg-destructive/10 text-destructive",
       },
       expired: { label: "Hết hạn", className: "bg-muted text-muted-foreground" },
     };
   
     const { label, className } = config[status] || config.not_found;
   
     return (
       <Badge variant="secondary" className={`text-xs ${className}`}>
         {label}
       </Badge>
     );
   }
   
   // Status Legend Item
   function StatusLegendItem({
     status,
     label,
   }: {
     status: CheckInResult["status"];
     label: string;
   }) {
     const config = {
       entered: {
         icon: <CheckCircle className="h-4 w-4 text-success" />,
         bg: "bg-success/10",
       },
       checked_out: {
         icon: <CheckCircle className="h-4 w-4 text-blue-500" />,
         bg: "bg-blue-50",
       },
       already_used: {
         icon: <AlertCircle className="h-4 w-4 text-warning" />,
         bg: "bg-warning/10",
       },
       not_found: {
         icon: <XCircle className="h-4 w-4 text-destructive" />,
         bg: "bg-destructive/10",
       },
       cancelled: {
         icon: <XCircle className="h-4 w-4 text-destructive" />,
         bg: "bg-destructive/10",
       },
       expired: {
         icon: <XCircle className="h-4 w-4 text-muted-foreground" />,
         bg: "bg-muted",
       },
     };
   
     const { icon, bg } = config[status] || config.not_found;
   
     return (
       <div className={`flex items-center gap-2 p-2 rounded-md ${bg}`}>
         {icon}
         <span className="text-xs">{label}</span>
       </div>
     );
   }