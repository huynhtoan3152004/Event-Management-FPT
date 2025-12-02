module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/(public)/clubs/loading.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/(public)/clubs/loading.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/(public)/clubs/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

// /* ============================================
//    Clubs Page
//    List all clubs with details
//    ============================================ */
// "use client"
// import { useState } from "react"
// import Image from "next/image"
// import Link from "next/link"
// import { Header } from "@/components/shared/header"
// import { Footer } from "@/components/shared/footer"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Search, Users } from "lucide-react"
// import { MOCK_CLUBS } from "@/lib/constants"
// import { useFadeInOnScroll } from "@/hooks/use-gsap"
// const categories = ["Tất cả", "Technology", "Culture", "Business", "Sports", "Arts", "Academic"]
// export default function ClubsPage() {
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedCategory, setSelectedCategory] = useState("Tất cả")
//   const sectionRef = useFadeInOnScroll<HTMLDivElement>()
//   const filteredClubs = MOCK_CLUBS.filter((club) => {
//     const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase())
//     const matchesCategory = selectedCategory === "Tất cả" || club.category === selectedCategory
//     return matchesSearch && matchesCategory
//   })
//   return (
//     <main className="min-h-screen">
//       <Header />
//       <div className="pt-24 pb-16 bg-gradient-to-b from-accent/20 to-background">
//         <div className="container mx-auto px-4">
//           {/* Page Header */}
//           <div className="text-center mb-12">
//             <h1 className="text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
//               Câu Lạc Bộ FPTU
//             </h1>
//             <p className="text-muted-foreground max-w-2xl mx-auto">
//               Khám phá các câu lạc bộ và tìm cộng đồng phù hợp với đam mê của bạn
//             </p>
//           </div>
//           {/* Search */}
//           <div className="max-w-md mx-auto mb-8">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//               <Input
//                 placeholder="Tìm kiếm câu lạc bộ..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10 rounded-full"
//               />
//             </div>
//           </div>
//           {/* Category Filter */}
//           <div className="flex flex-wrap justify-center gap-2 mb-12">
//             {categories.map((category) => (
//               <Badge
//                 key={category}
//                 variant={selectedCategory === category ? "default" : "outline"}
//                 className="cursor-pointer px-4 py-2 rounded-full"
//                 onClick={() => setSelectedCategory(category)}
//               >
//                 {category}
//               </Badge>
//             ))}
//           </div>
//           {/* Clubs Grid */}
//           <div ref={sectionRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {filteredClubs.map((club) => (
//               <div
//                 key={club.id}
//                 className="bg-card rounded-2xl p-8 text-center shadow-sm border hover:shadow-lg transition-all group"
//               >
//                 <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden">
//                   <Image
//                     src={club.imageUrl || "/placeholder.svg"}
//                     alt={club.name}
//                     fill
//                     className="object-cover group-hover:scale-110 transition-transform duration-500"
//                   />
//                 </div>
//                 <Badge variant="secondary" className="mb-3">
//                   {club.category}
//                 </Badge>
//                 <h3 className="font-semibold text-xl text-foreground mb-2">{club.name}</h3>
//                 <p className="text-muted-foreground mb-4 line-clamp-2">{club.description}</p>
//                 <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
//                   <Users className="h-4 w-4" />
//                   <span>{club.memberCount} thành viên</span>
//                 </div>
//                 <Link href={`/clubs/${club.id}`}>
//                   <Button className="rounded-full">Tìm hiểu thêm</Button>
//                 </Link>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </main>
//   )
// }
}),
"[project]/app/(public)/clubs/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/(public)/clubs/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__47f28dea._.js.map