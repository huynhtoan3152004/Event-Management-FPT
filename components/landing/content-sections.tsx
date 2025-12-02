/* ============================================
   Content Sections Component
   Three-column layout for different content types
   ============================================ */

"use client"

import { useFadeInOnScroll } from "@/hooks/use-gsap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const sections = [
  {
    title: "Ongoing Events",
    description: "Placeholder for ongoing events section.",
  },
  {
    title: "Upcoming Club Events",
    description: "Placeholder for upcoming club events section.",
  },
  {
    title: "Club Introductions",
    description: "Placeholder for club introductions section.",
  },
]

export function ContentSections() {
  const sectionRef = useFadeInOnScroll<HTMLElement>()

  return (
    <section ref={sectionRef} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Page Content Area</h2>
        </div>

        {/* Three Column Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <Card key={index} className="bg-card">
              <CardHeader>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{section.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
