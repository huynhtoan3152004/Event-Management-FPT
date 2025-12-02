/* ============================================
   About Page
   Information about FPTU Event Hub
   ============================================ */

import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, Award, Zap } from "lucide-react"

const features = [
  {
    icon: Calendar,
    title: "Quản lý sự kiện",
    description: "Tìm kiếm, đăng ký và quản lý tất cả các sự kiện trong trường một cách dễ dàng.",
  },
  {
    icon: Users,
    title: "Kết nối cộng đồng",
    description: "Tham gia các câu lạc bộ và kết nối với những người cùng đam mê.",
  },
  {
    icon: Award,
    title: "Theo dõi hoạt động",
    description: "Ghi nhận và theo dõi lịch sử tham gia các hoạt động ngoại khóa.",
  },
  {
    icon: Zap,
    title: "Check-in nhanh chóng",
    description: "Hệ thống QR code giúp check-in sự kiện trong tích tắc.",
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Về FPTU Event Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Nền tảng chính thức dành cho sinh viên FPT University để khám phá, đăng ký và trải nghiệm các sự kiện
              trong khuôn viên trường.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mission Statement */}
          <div className="bg-accent/30 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Sứ mệnh của chúng tôi</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Chúng tôi tin rằng mỗi sinh viên đều xứng đáng có cơ hội khám phá và phát triển bản thân thông qua các
              hoạt động ngoại khóa. FPTU Event Hub ra đời với mong muốn trở thành cầu nối giữa sinh viên và các câu lạc
              bộ, tổ chức trong trường, giúp việc tham gia hoạt động trở nên dễ dàng và thuận tiện hơn bao giờ hết.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
