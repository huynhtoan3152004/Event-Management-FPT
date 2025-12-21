/* ============================================
   Create Event Page (Organizer)
   Form tạo sự kiện, gửi multipart/form-data
   ============================================ */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import {
  Calendar,
  Clock,
  MapPin,
  Rows,
  Upload,
  Users,
  LayoutGrid,
  Tag,
  Image as ImageIcon,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import apiClient from "@/lib/api/client"

type Hall = {
  hallId: string
  name: string
  location?: string
  capacity?: number
  status?: string
}

type Speaker = {
  speakerId: string
  name: string
  bio?: string
}

export default function CreateEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [isHallsLoading, setIsHallsLoading] = useState(false);
  const [selectedHallId, setSelectedHallId] = useState<string | undefined>(
    undefined
  );
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isSpeakersLoading, setIsSpeakersLoading] = useState(false);
  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState<string[]>([]);

  // Validation states
  const [dateError, setDateError] = useState<string>("");
  const [timeError, setTimeError] = useState<string>("");
  const [registrationStartError, setRegistrationStartError] =
    useState<string>("");
  const [registrationEndError, setRegistrationEndError] = useState<string>("");
  const [titleError, setTitleError] = useState<string>("");

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];
  
  // Get date 3 days from now for min attribute of event date
  const minEventDate = new Date();
  minEventDate.setDate(minEventDate.getDate() + 3);
  const minEventDateStr = minEventDate.toISOString().split("T")[0];
  
  // Get current datetime in format for datetime-local input (YYYY-MM-DDTHH:mm)
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
  const minDateTimeLocal = getCurrentDateTimeLocal();

  // Validate time range
  const validateTimeRange = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) {
      setTimeError("");
      return;
    }

    const startTimeParts = startTime.split(":").map(Number);
    const endTimeParts = endTime.split(":").map(Number);
    const startMinutes = startTimeParts[0] * 60 + (startTimeParts[1] || 0);
    const endMinutes = endTimeParts[0] * 60 + (endTimeParts[1] || 0);

    if (endMinutes <= startMinutes) {
      setTimeError("Giờ kết thúc phải sau giờ bắt đầu");
    } else {
      setTimeError("");
    }
  };

  /**
   * VALIDATE NGÀY ĐĂNG KÝ VÀ NGÀY KẾT THÚC ĐĂNG KÝ
   * 
   * Rules:
   * 1. Không được chọn ngày/giờ trong quá khứ
   * 2. Ngày đăng ký phải trước ngày diễn ra sự kiện
   * 3. Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký ít nhất 2 tiếng
   *    (Cho phép trùng ngày nhưng giờ phải cách nhau ít nhất 2 tiếng)
   * 4. Ngày kết thúc đăng ký phải trước ngày diễn ra sự kiện
   */
  const validateRegistrationDate = (
    registrationDate: string,
    field: "start" | "end"
  ) => {
    if (!registrationDate) {
      if (field === "start") {
        setRegistrationStartError("");
      } else {
        setRegistrationEndError("");
      }
      return;
    }

    const regDate = new Date(registrationDate);
    const now = new Date();
    now.setSeconds(0, 0); // Set seconds và milliseconds về 0 để so sánh chính xác

    // Rule 1: Không được chọn ngày trong quá khứ
    if (regDate < now) {
      const errorMsg = "Không được chọn ngày/giờ trong quá khứ";
      if (field === "start") {
        setRegistrationStartError(errorMsg);
      } else {
        setRegistrationEndError(errorMsg);
      }
      return;
    }

    const dateInput = document.getElementById("date") as HTMLInputElement;
    const eventDate = dateInput?.value;

    if (!eventDate) {
      // Nếu chưa chọn ngày sự kiện, chỉ validate không được quá khứ
      if (field === "start") {
        setRegistrationStartError("");
      } else {
        setRegistrationEndError("");
      }
      return;
    }

    const evtDate = new Date(eventDate);
    evtDate.setHours(0, 0, 0, 0);

    // Set registration date to start of day for fair comparison với event date
    const regDateOnly = new Date(regDate);
    regDateOnly.setHours(0, 0, 0, 0);

    // Rule 2: Registration date must be BEFORE event date
    if (regDateOnly >= evtDate) {
      const errorMsg = "Ngày đăng ký phải trước ngày diễn ra sự kiện";
      if (field === "start") {
        setRegistrationStartError(errorMsg);
      } else {
        setRegistrationEndError(errorMsg);
      }
      return;
    }

    // Rule 3: Nếu là ngày kết thúc, phải sau ngày bắt đầu đăng ký ít nhất 2 tiếng
    // Cho phép trùng ngày nhưng giờ phải cách nhau ít nhất 2 tiếng
    if (field === "end") {
      const regStartInput = document.getElementById("registrationStart") as HTMLInputElement;
      const regStartValue = regStartInput?.value;
      
      if (regStartValue) {
        const regStartDate = new Date(regStartValue);
        
        // Tính số giờ chênh lệch (có thể âm nếu ngày kết thúc trước ngày bắt đầu)
        const hoursDiff = (regDate.getTime() - regStartDate.getTime()) / (1000 * 60 * 60);
        
        // Ngày kết thúc phải sau ngày bắt đầu ít nhất 2 tiếng
        if (hoursDiff < 2) {
          setRegistrationEndError("Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký ít nhất 2 tiếng");
          return;
        }
      }
    }

    // Nếu là ngày bắt đầu, kiểm tra ngày kết thúc có hợp lệ không
    if (field === "start") {
      const regEndInput = document.getElementById("registrationEnd") as HTMLInputElement;
      const regEndValue = regEndInput?.value;
      
      if (regEndValue) {
        const regEndDate = new Date(regEndValue);
        const hoursDiff = (regEndDate.getTime() - regDate.getTime()) / (1000 * 60 * 60);
        
        // Ngày kết thúc phải sau ngày bắt đầu ít nhất 2 tiếng
        if (hoursDiff < 2) {
          setRegistrationEndError("Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký ít nhất 2 tiếng");
        } else {
          setRegistrationEndError("");
        }
      }
    }

    // Clear error nếu tất cả validation đều pass
    if (field === "start") {
      setRegistrationStartError("");
    } else {
      setRegistrationEndError("");
    }
  };

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setIsHallsLoading(true);
        const res = await apiClient.get<{ success: boolean; data: Hall[] }>(
          "/api/Halls"
        );
        if (Array.isArray(res.data?.data)) {
          setHalls(res.data.data);
        }
      } catch (error) {
        toast.error(
          "Không tải được danh sách hall, hãy thử lại."
        );
      } finally {
        setIsHallsLoading(false);
      }
    };
    fetchHalls();
  }, []);

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        setIsSpeakersLoading(true);
        const res = await apiClient.get<{ success: boolean; data: Speaker[] }>(
          "/api/Speakers"
        );
        if (Array.isArray(res.data?.data)) {
          setSpeakers(res.data.data);
        }
      } catch (error) {
        toast.error(
          "Không tải được danh sách speaker, bạn có thể nhập thủ công ở backend."
        );
      } finally {
        setIsSpeakersLoading(false);
      }
    };
    fetchSpeakers();
  }, []);
  /**
   * CONVERT DATETIME-LOCAL TO UTC ISO STRING
   * 
   * Vấn đề: Backend nhận DateTime và dùng DateTime.SpecifyKind(..., DateTimeKind.Utc)
   * Backend coi datetime đã được gửi là UTC và chỉ set Kind, không convert timezone.
   * 
   * Giải pháp: Frontend cần gửi datetime ở UTC (không có timezone offset)
   * 
   * Input: "2025-01-20T08:00" (local time từ datetime-local input)
   * Output: "2025-01-20T01:00:00Z" (UTC, nếu local timezone là +07:00)
   * 
   * Logic:
   * 1. Parse datetime-local string như local time
   * 2. Convert sang UTC bằng toISOString()
   * 3. Backend sẽ nhận UTC và lưu đúng
   */
  const toLocalISOStringWithOffset = (local: string) => {
    // local: "2025-01-20T08:00" (datetime-local format, không có timezone)
    // JavaScript sẽ parse nó như local time của browser
    const d = new Date(local);
    
    // Convert sang UTC và trả về ISO string với "Z" (UTC)
    // Ví dụ: "2025-01-20T01:00:00.000Z" nếu local timezone là +07:00
    return d.toISOString();
  };

  const postEvent = async (payload: {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    hallId?: string;
    // clubName?: string
    registrationStart?: string;
    registrationEnd?: string;
    tags?: string | string[];
    maxTicketsPerUser?: number;
    imageFile?: File | null;
    speakerIds?: string[];
  }) => {
    const formDataApi = new FormData();

    formDataApi.append("Title", payload.title);
    formDataApi.append("Date", payload.date);

    const startTimeFormatted =
      payload.startTime.includes(":") &&
      payload.startTime.split(":").length === 2
        ? `${payload.startTime}:00`
        : payload.startTime;
    const endTimeFormatted =
      payload.endTime.includes(":") && payload.endTime.split(":").length === 2
        ? `${payload.endTime}:00`
        : payload.endTime;

    formDataApi.append("StartTime", startTimeFormatted);
    formDataApi.append("EndTime", endTimeFormatted);

    if (payload.description?.trim())
      formDataApi.append("Description", payload.description);
    // HallId optional; append only when provided
    if (payload.hallId?.trim()) {
      formDataApi.append("HallId", payload.hallId);
    }
    // if (payload.clubName?.trim()) formDataApi.append("ClubName", payload.clubName)
if (payload.registrationStart) {
  formDataApi.append(
    "RegistrationStart",
    toLocalISOStringWithOffset(payload.registrationStart)
  );
}

if (payload.registrationEnd) {
  formDataApi.append(
    "RegistrationEnd",
    toLocalISOStringWithOffset(payload.registrationEnd)
  );
}
    if (payload.tags) {
      const tagsValue = Array.isArray(payload.tags)
        ? payload.tags.join(",")
        : payload.tags;
      if (tagsValue.trim()) formDataApi.append("Tags", tagsValue);
    }

    // MaxTicketsPerUser luôn set là 1
    formDataApi.append("MaxTicketsPerUser", "1");

    if (payload.imageFile) {
      formDataApi.append("ImageFile", payload.imageFile);
    }

    if (payload.speakerIds && payload.speakerIds.length > 0) {
      payload.speakerIds.forEach((id) => formDataApi.append("SpeakerIds", id));
    }

    const response = await apiClient.post("/api/Events", formDataApi, {
      timeout: 120000,
    });
    return response.data;
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);

      // Reset validation errors
      setTitleError("");
      setDateError("");
      setTimeError("");
      setRegistrationStartError("");
      setRegistrationEndError("");

      // Extract values
      const payload = {
        title: (formData.get("title") as string)?.trim() || "",
        description:
          (formData.get("description") as string)?.trim() || undefined,
        date: formData.get("date") as string,
        startTime: formData.get("startTime") as string,
        endTime: formData.get("endTime") as string,
        hallId: selectedHallId || undefined,
        // clubName: (formData.get("clubName") as string) || undefined,
        registrationStart:
          (formData.get("registrationStart") as string) || undefined,
        registrationEnd:
          (formData.get("registrationEnd") as string) || undefined,
        tags:
          (formData.get("tags") as string)
            ?.split(",")
            .map((t) => t.trim())
            .filter(Boolean) || [],
        maxTicketsPerUser: 1, // Luôn set là 1
        imageFile,
        speakerIds: selectedSpeakerIds,
      };

      // Validate required fields
      let hasError = false;

      if (!payload.title || payload.title.trim().length === 0) {
        setTitleError("Tiêu đề là bắt buộc");
        hasError = true;
      } else if (payload.title.trim().length < 3) {
        setTitleError("Tiêu đề phải có ít nhất 3 ký tự");
        hasError = true;
      }

      if (!payload.date) {
        setDateError("Ngày sự kiện là bắt buộc");
        hasError = true;
      } else {
        // Validate date không được ở quá khứ và phải cách ít nhất 3 ngày
        const eventDate = new Date(payload.date);
        eventDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (eventDate < today) {
          setDateError("Ngày sự kiện không được ở quá khứ");
          hasError = true;
        } else {
          const daysDiff = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff < 3) {
            setDateError("Ngày diễn ra phải cách ngày hiện tại ít nhất 3 ngày");
            hasError = true;
          }
        }
      }

      if (!payload.startTime) {
        setTimeError("Giờ bắt đầu là bắt buộc");
        hasError = true;
      } else if (!payload.endTime) {
        setTimeError("Giờ kết thúc là bắt buộc");
        hasError = true;
      } else {
        // Validate EndTime > StartTime
        const startTimeParts = payload.startTime.split(":").map(Number);
        const endTimeParts = payload.endTime.split(":").map(Number);
        const startMinutes = startTimeParts[0] * 60 + (startTimeParts[1] || 0);
        const endMinutes = endTimeParts[0] * 60 + (endTimeParts[1] || 0);

        if (endMinutes <= startMinutes) {
          setTimeError("Giờ kết thúc phải sau giờ bắt đầu");
          hasError = true;
        }
      }

      // Validate hallId phải có (bắt buộc)
      if (!payload.hallId) {
        toast.error("Vui lòng chọn Hall");
        hasError = true;
      }

      /**
       * VALIDATE NGÀY ĐĂNG KÝ VÀ NGÀY KẾT THÚC ĐĂNG KÝ
       * 
       * Rules:
       * 1. Không được chọn ngày/giờ trong quá khứ
       * 2. Ngày đăng ký phải trước ngày diễn ra sự kiện
       * 3. Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký (không được trùng)
       * 4. Ngày kết thúc đăng ký phải trước ngày diễn ra sự kiện
       */
      const now = new Date();
      now.setSeconds(0, 0); // Set seconds và milliseconds về 0 để so sánh chính xác

      if (payload.registrationStart) {
        const regStartDate = new Date(payload.registrationStart);
        
        // Rule 1: Không được chọn ngày/giờ trong quá khứ
        if (regStartDate < now) {
          setRegistrationStartError("Không được chọn ngày/giờ trong quá khứ");
          hasError = true;
        } else {
          // Rule 2: Ngày đăng ký phải trước ngày diễn ra sự kiện
          const evtDate = new Date(payload.date);
          evtDate.setHours(0, 0, 0, 0);
          const regStartDateOnly = new Date(regStartDate);
          regStartDateOnly.setHours(0, 0, 0, 0);
          
          if (regStartDateOnly >= evtDate) {
            setRegistrationStartError("Ngày bắt đầu đăng ký phải trước ngày diễn ra sự kiện");
            hasError = true;
          }
        }
      }
      
      if (payload.registrationEnd) {
        const regEndDate = new Date(payload.registrationEnd);
        
        // Rule 1: Không được chọn ngày/giờ trong quá khứ
        if (regEndDate < now) {
          setRegistrationEndError("Không được chọn ngày/giờ trong quá khứ");
          hasError = true;
        } else {
          // Rule 3: Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký ít nhất 2 tiếng
          // Cho phép trùng ngày nhưng giờ phải cách nhau ít nhất 2 tiếng
          if (payload.registrationStart) {
            const regStartDate = new Date(payload.registrationStart);
            const hoursDiff = (regEndDate.getTime() - regStartDate.getTime()) / (1000 * 60 * 60);
            
            if (hoursDiff < 2) {
              setRegistrationEndError("Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký ít nhất 2 tiếng");
              hasError = true;
            }
          }
          
          // Rule 4: Ngày kết thúc đăng ký phải trước ngày diễn ra sự kiện
          const evtDate = new Date(payload.date);
          evtDate.setHours(0, 0, 0, 0);
          const regEndDateOnly = new Date(regEndDate);
          regEndDateOnly.setHours(0, 0, 0, 0);
          
          if (regEndDateOnly >= evtDate) {
            setRegistrationEndError("Ngày kết thúc đăng ký phải trước ngày diễn ra sự kiện");
            hasError = true;
          }
        }
      }

      if (hasError) {
        toast.error("Vui lòng kiểm tra và điền đủ thông tin cần thiết");
        setIsSubmitting(false);
        return;
      }

      const response = await postEvent(payload);
      console.log("Event created response:", response);
      console.log(
        "Event status:",
        response?.data?.status || response?.status || "unknown"
      );

      toast.success("Tạo sự kiện thành công!");
      router.push("/organizer/events");
    } catch (error: any) {
      // Xử lý lỗi chi tiết hơn
      let message = "Tạo sự kiện thất bại. Vui lòng kiểm tra lại dữ liệu.";

      // Kiểm tra xem có response từ server không (nếu có thì không phải CORS)
      if (error?.response) {
        // Có response từ server - đây là lỗi từ server, không phải CORS
        const status = error.response.status;
        const data = error.response.data;

        if (data) {
          // Có data trong response - kiểm tra nhiều format khác nhau
          if (typeof data === "string") {
            // Response là string trực tiếp
            message = data;
          } else if (data.message) {
            // Response có format { message: ... }
            message = data.message;
          } else if (data.error) {
            // Response có format { error: ... }
            message = data.error;
          } else if (Array.isArray(data) && data.length > 0) {
            // Response là array of errors
            message = data.join(", ");
          } else if (data.errors && Array.isArray(data.errors)) {
            // Validation errors format
            message = data.errors.join(", ");
          } else {
            // Có data nhưng không parse được - log để debug
            message =
              JSON.stringify(data) ||
              `Lỗi server (${status}). Vui lòng thử lại sau.`;
          }
        } else {
          // Response nhưng không có body - có thể là exception không được handle ở backend
          message = `Lỗi server (${status}). Có thể do dữ liệu không hợp lệ hoặc lỗi xử lý ở backend. Vui lòng kiểm tra lại dữ liệu.`;
        }
      } else if (error?.request) {
        // Request được gửi nhưng không nhận được response - có thể là CORS hoặc network
        if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
          message =
            "Lỗi kết nối: Backend không phản hồi hoặc bị chặn bởi CORS. Vui lòng kiểm tra cấu hình server.";
        } else {
          message =
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
        }
      } else if (error?.message) {
        message = error.message;
      }

      // Log chi tiết để debug
      console.error("❌ Error creating event:", {
        hasResponse: !!error?.response,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        responseData: error?.response?.data,
        errorMessage: error?.message,
        errorCode: error?.code,
        fullError: error,
      });

      // Log chi tiết response từ server
      if (error?.response) {
        console.error("📥 Server Response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          dataType: typeof error.response.data,
          dataStringified: JSON.stringify(error.response.data, null, 2),
        });
      }

      // Log request details để debug
      if (error?.config) {
        console.error("📤 Request Details:", {
          url: error.config.url,
          method: error.config.method,
          data: error.config.data,
        });
      }
      toast.error(message, {
        position: "top-right",
        autoClose: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    handleSubmit(form);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Organizer</span>
            <span>/</span>
            <span>Events</span>
            <span>/</span>
            <span className="text-foreground font-medium">Create</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Tạo sự kiện mới
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            Điền thông tin chi tiết sự kiện. Hệ thống sẽ tự động cấu hình chỗ
            ngồi theo hall.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Thông tin chính
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Tiêu đề, mô tả, thời gian và hall
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-5 p-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Tiêu đề *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="FPTU Tech Summit 2025"
                    required
                    className={`h-11 border-2 focus:border-primary transition-colors ${
                      titleError ? "border-destructive" : ""
                    }`}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (!value || value.length === 0) {
                        setTitleError("Tiêu đề là bắt buộc");
                      } else if (value.length < 3) {
                        setTitleError("Tiêu đề phải có ít nhất 3 ký tự");
                      } else {
                        setTitleError("");
                      }
                    }}
                  />
                  {titleError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span>⚠</span>
                      {titleError}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold"
                  >
                    Mô tả
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Mô tả ngắn gọn về sự kiện..."
                    rows={4}
                    className="border-2 focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="date"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4 text-primary" />
                    Ngày *
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    min={minEventDateStr}
                    className={`h-11 border-2 focus:border-primary transition-colors ${
                      dateError ? "border-destructive" : ""
                    }`}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      if (selectedDate) {
                        const eventDate = new Date(selectedDate);
                        eventDate.setHours(0, 0, 0, 0);
                        
                        const todayDate = new Date();
                        todayDate.setHours(0, 0, 0, 0);
                        
                        // Rule 1: Không được chọn ngày trong quá khứ
                        if (eventDate < todayDate) {
                          setDateError("Ngày không được chọn ngày trong quá khứ");
                        } else {
                          // Rule 2: Ngày diễn ra phải cách ngày hiện tại ít nhất 3 ngày
                          const daysDiff = Math.floor((eventDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
                          if (daysDiff < 3) {
                            setDateError("Ngày diễn ra phải cách ngày hiện tại ít nhất 3 ngày");
                          } else {
                            setDateError("");
                          }
                        }

                        // Re-validate registration dates when event date changes
                        const regStartInput = document.getElementById(
                          "registrationStart"
                        ) as HTMLInputElement;
                        const regEndInput = document.getElementById(
                          "registrationEnd"
                        ) as HTMLInputElement;
                        if (regStartInput?.value) {
                          validateRegistrationDate(
                            regStartInput.value,
                            "start"
                          );
                        }
                        if (regEndInput?.value) {
                          validateRegistrationDate(regEndInput.value, "end");
                        }
                      } else {
                        setDateError("");
                      }
                    }}
                  />
                  {dateError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span>⚠</span>
                      {dateError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="startTime"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-primary" />
                    Giờ bắt đầu *
                  </Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    required
                    className={`h-11 border-2 focus:border-primary transition-colors ${
                      timeError ? "border-destructive" : ""
                    }`}
                    onChange={(e) => {
                      const startTime = e.target.value;
                      const endTimeInput = document.getElementById(
                        "endTime"
                      ) as HTMLInputElement;
                      const endTime = endTimeInput?.value;
                      if (startTime && endTime) {
                        validateTimeRange(startTime, endTime);
                      } else {
                        setTimeError("");
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="endTime"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-primary" />
                    Giờ kết thúc *
                  </Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    required
                    className={`h-11 border-2 focus:border-primary transition-colors ${
                      timeError ? "border-destructive" : ""
                    }`}
                    onChange={(e) => {
                      const endTime = e.target.value;
                      const startTimeInput = document.getElementById(
                        "startTime"
                      ) as HTMLInputElement;
                      const startTime = startTimeInput?.value;
                      if (startTime && endTime) {
                        validateTimeRange(startTime, endTime);
                      } else {
                        setTimeError("");
                      }
                    }}
                  />
                  {timeError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span>⚠</span>
                      {timeError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hallId" className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Hall{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  {isHallsLoading ? (
                    <Skeleton className="h-11 w-full" />
                  ) : halls.length > 0 ? (
                    <Select
                      value={selectedHallId ?? undefined}
                      onValueChange={(value) => {
                        if (value === "__none") {
                          setSelectedHallId(undefined);
                        } else {
                          setSelectedHallId(value as string);
                        }
                      }}
                    >
                      <SelectTrigger id="hallId" className="h-11 border-2 focus:border-primary transition-colors">
                        <SelectValue placeholder="Chọn hall" />
                      </SelectTrigger>
                      <SelectContent>
                        {halls.map((hall) => (
                          <SelectItem key={hall.hallId} value={hall.hallId}>
                            {hall.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span>⚠</span>
                      Không tải được hall. Vui lòng thử lại.
                    </p>
                  )}
                </div>

              </CardContent>
            </Card>

            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Thiết lập ngày đăng ký 
                </CardTitle>
                
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-5 p-6">
                <div className="space-y-2">
                  <Label htmlFor="registrationStart">Thời gian bắt đầu đăng kí</Label>
                  <Input
                    id="registrationStart"
                    name="registrationStart"
                    type="datetime-local"
                    min={minDateTimeLocal}
                    className={
                      registrationStartError ? "border-destructive" : ""
                    }
                    onChange={(e) => {
                      validateRegistrationDate(e.target.value, "start");
                      // Update min của registrationEnd khi registrationStart thay đổi
                      // Min = registrationStart + 2 tiếng (cho phép trùng ngày nhưng phải cách ít nhất 2 tiếng)
                      const regEndInput = document.getElementById("registrationEnd") as HTMLInputElement;
                      if (regEndInput && e.target.value) {
                        const regStartDate = new Date(e.target.value);
                        regStartDate.setHours(regStartDate.getHours() + 2); // Thêm 2 tiếng
                        
                        // Format thành datetime-local format (YYYY-MM-DDTHH:mm)
                        const year = regStartDate.getFullYear();
                        const month = String(regStartDate.getMonth() + 1).padStart(2, '0');
                        const day = String(regStartDate.getDate()).padStart(2, '0');
                        const hours = String(regStartDate.getHours()).padStart(2, '0');
                        const minutes = String(regStartDate.getMinutes()).padStart(2, '0');
                        regEndInput.min = `${year}-${month}-${day}T${hours}:${minutes}`;
                      }
                    }}
                  />
                  {registrationStartError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span>⚠</span>
                      {registrationStartError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationEnd">Thời gian kết thúc đăng kí</Label>
                  <Input
                    id="registrationEnd"
                    name="registrationEnd"
                    type="datetime-local"
                    min={minDateTimeLocal}
                    className={registrationEndError ? "border-destructive" : ""}
                    onChange={(e) => {
                      validateRegistrationDate(e.target.value, "end");
                    }}
                  />
                  {registrationEndError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span>⚠</span>
                      {registrationEndError}
                    </p>
                  )}
                </div>

              </CardContent>
            </Card>

            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Thông tin bổ sung
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Tags, Speakers, Ảnh
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {/* <div className="space-y-2">
                  <Label htmlFor="clubName">ClubName</Label>
                  <Input id="clubName" name="clubName" placeholder="FPTU Event Club" />
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (phân tách bởi dấu phẩy)</Label>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="tech, ai, seminar"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Speakers (tuỳ chọn)</Label>
                  {isSpeakersLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : speakers.length > 0 ? (
                    <div className="grid gap-2">
                      <div className="rounded-lg border bg-card p-3 space-y-3 max-h-64 overflow-y-auto">
                        {speakers.map((sp) => {
                          const checked = selectedSpeakerIds.includes(
                            sp.speakerId
                          );
                          return (
                            <label
                              key={sp.speakerId}
                              className="flex items-start gap-3 text-sm cursor-pointer rounded-md border hover:border-primary/50 transition-colors p-2"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 mt-0.5 accent-primary"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSpeakerIds((prev) => [
                                      ...prev,
                                      sp.speakerId,
                                    ]);
                                  } else {
                                    setSelectedSpeakerIds((prev) =>
                                      prev.filter((id) => id !== sp.speakerId)
                                    );
                                  }
                                }}
                              />
                              <div className="space-y-1">
                                <div className="font-semibold text-foreground">
                                  {sp.name}
                                </div>
                                {sp.bio && (
                                  <div className="text-xs text-muted-foreground leading-snug line-clamp-2">
                                    {sp.bio}
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      {selectedSpeakerIds.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Đã chọn {selectedSpeakerIds.length} speaker
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Chưa có speaker. Vui lòng thêm speaker trước.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="imageFile">Ảnh sự kiện</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() =>
                        document.getElementById("imageFile")?.click()
                      }
                    >
                      <Upload className="h-4 w-4" />
                      Chọn ảnh
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {imageFile ? imageFile.name : "Chưa chọn ảnh"}
                    </span>
                  </div>
                  <Input
                    id="imageFile"
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Giới hạn 5MB
                        const maxSize = 5 * 1024 * 1024; // 5MB
                        if (file.size > maxSize) {
                          toast.error(
                            `Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB. (Hiện tại: ${(
                              file.size /
                              1024 /
                              1024
                            ).toFixed(2)}MB)`,
                            {
                              position: "top-right",
                              autoClose: 5000,
                            }
                          );
                          e.target.value = ""; // Reset input
                          setImageFile(null);
                          return;
                        }
                        setImageFile(file);
                      } else {
                        setImageFile(null);
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mb-5">
                    Kích thước tối đa: 5MB. Định dạng: JPG, PNG, GIF
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Summary & submit */}
          <div className="space-y-6">
            <Card className="sticky top-24 border-2 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Gửi sự kiện
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Xác nhận thông tin trước khi tạo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="text-sm text-muted-foreground space-y-2 bg-muted/50 p-4 rounded-lg border">
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-semibold">•</span>
                    <span>Title, Date, StartTime, EndTime là bắt buộc.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-semibold">•</span>
                    <span>
                      RegistrationStart/End nên là dạng datetime-local.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-semibold">•</span>
                    <span>
                      Tags/Speaker nhập và chọn danh sách, phân tách dấu phẩy.
                    </span>
                  </p>
                </div>
                <Separator />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Tạo sự kiện
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full h-11 text-base border-2 hover:bg-muted transition-all duration-300 mb-5"
                  onClick={() => router.push("/organizer/events")}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </main>
  );
}

