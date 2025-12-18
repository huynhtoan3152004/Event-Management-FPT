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
  const hasScannedRef = useRef<boolean>(false) // Prevent multiple scans
  const onScanSuccessRef = useRef(onScanSuccess) // Store callback in ref to avoid recreating scanner
  const isMountedRef = useRef(true)

  // Update ref when callback changes (but don't restart scanner)
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess
  }, [onScanSuccess])

  useEffect(() => {
    isMountedRef.current = true
    hasScannedRef.current = false // Reset scan flag when component mounts
    let scanner: Html5Qrcode | null = null
    
    const stopScanner = async () => {
      if (scanner) {
        try {
          const state = scanner.getState()
          if (state === 2) { // SCANNING state
            await scanner.stop()
          }
          await scanner.clear()
        } catch (err) {
          // Ignore errors when stopping
        }
      }
    }

    const startScanning = async () => {
      try {
        // Clear any existing scanner first
        const existingElement = document.getElementById("qr-reader")
        if (existingElement) {
          existingElement.innerHTML = "" // Clear previous scanner instance
        }

        scanner = new Html5Qrcode("qr-reader")
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: "environment" }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            console.log("QR Code scanned:", decodedText)
            // Prevent multiple calls - only process first scan
            if (hasScannedRef.current || !isMountedRef.current) {
              console.log("Scan ignored - already processed or unmounted")
              return
            }
            
            hasScannedRef.current = true
            
            // Stop scanner immediately
            await stopScanner()
            
            // Call callback after scanner is stopped
            if (isMountedRef.current) {
              console.log("Calling onScanSuccess with:", decodedText)
              onScanSuccessRef.current(decodedText)
            }
          },
          (errorMessage) => {
            // Error callback - ignore errors while scanning (they're normal)
            // Only log if it's a significant error
            if (errorMessage && !errorMessage.includes("NotFoundException")) {
              console.debug("QR scan error (normal):", errorMessage)
            }
          }
        )

        if (isMountedRef.current) {
          setIsScanning(true)
          setError("")
        }
      } catch (err: any) {
        console.error("Error starting QR scanner:", err)
        if (isMountedRef.current) {
          setError("Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập camera.")
        }
      }
    }

    startScanning()

    return () => {
      isMountedRef.current = false
      hasScannedRef.current = true // Prevent any pending callbacks
      stopScanner()
    }
  }, []) // Empty dependency - only run once on mount

  const handleClose = async () => {
    hasScannedRef.current = true // Prevent any pending scans
    isMountedRef.current = false
    
    // Stop scanner
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        if (state === 2) { // SCANNING state
          await scannerRef.current.stop()
        }
        await scannerRef.current.clear()
        scannerRef.current = null
      } catch (err) {
        // Ignore
      }
    }
    
    // Clear the DOM element
    const element = document.getElementById("qr-reader")
    if (element) {
      element.innerHTML = ""
    }
    
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

