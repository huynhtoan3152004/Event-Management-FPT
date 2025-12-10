/* ============================================
   QR Scanner Component
   Component để quét QR code từ camera
   ============================================ */

"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onClose: () => void
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const startScanning = async () => {
      try {
        const scanner = new Html5Qrcode("qr-reader")
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: "environment" }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Success callback
            onScanSuccess(decodedText)
            stopScanning()
          },
          (errorMessage) => {
            // Error callback - ignore errors while scanning
          }
        )

        setIsScanning(true)
        setError("")
      } catch (err: any) {
        console.error("Error starting QR scanner:", err)
        setError("Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập camera.")
      }
    }

    startScanning()

    return () => {
      stopScanning()
    }
  }, [onScanSuccess])

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
      } catch (err) {
        console.error("Error stopping scanner:", err)
      }
      setIsScanning(false)
    }
  }

  const handleClose = async () => {
    await stopScanning()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Quét QR Code</h3>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-destructive">{error}</p>
              <Button onClick={handleClose}>Đóng</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                id="qr-reader"
                className="w-full rounded-lg overflow-hidden bg-black"
                style={{ minHeight: "300px" }}
              />
              <p className="text-sm text-center text-muted-foreground">
                Đưa QR code vào khung để quét tự động
              </p>
              <Button onClick={handleClose} className="w-full" variant="outline">
                Đóng
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

