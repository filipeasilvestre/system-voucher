"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsQR from "jsqr";
import { 
  Camera, 
  Ticket, 
  Scan, 
  CheckCircle, 
  XCircle, 
  LoaderCircle,
  RefreshCw,
  Keyboard,
  QrCode
} from "lucide-react";

interface VoucherData {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'used' | 'expired';
  amount?: number;
  currency?: string;
  expiryDate?: string;
  description?: string;
  redemptions: number;
  totalRedemptions: number;
}

export default function VoucherScanPage() {
  const [scanMode, setScanMode] = useState<'qr' | 'manual'>('qr');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voucherData, setVoucherData] = useState<VoucherData | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera for QR scanning
  const startCamera = useCallback(async () => {
    try {
      setError('');
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      streamRef.current = stream;
      setCameraPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Camera access denied or not available. Please use manual code entry.');
      setCameraPermission('denied');
      setIsScanning(false);
      setScanMode('manual');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Mock function to validate and process voucher
  const processVoucher = async (code: string): Promise<VoucherData> => {
    try {
      const response = await fetch("/api/vouchers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao validar o voucher");
      }
  
      const voucher = await response.json();
      return voucher;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Erro ao processar o voucher");
    }
  };

  // Handle voucher code submission
  const handleVoucherSubmit = async (code: string) => {
    if (!code.trim()) {
      setError('Please enter a voucher code');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      const voucher = await processVoucher(code.trim());
      setVoucherData(voucher);
      setSuccess('Voucher found and validated successfully!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process voucher');
      setVoucherData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle manual code form submission
  const handleManualSubmit = (e: React.KeyboardEvent | React.MouseEvent) => {
    e.preventDefault();
    handleVoucherSubmit(manualCode);
  };

  const detectQRCode = useCallback(() => {
    if (isScanning && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
  
      if (!context || video.videoWidth === 0 || video.videoHeight === 0) {
        // Se o vídeo ainda não estiver pronto, tente novamente no próximo frame
        requestAnimationFrame(detectQRCode);
        return;
      }
  
      // Configurar o canvas para capturar o frame do vídeo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      // Obter os dados da imagem do canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  
      // Usar jsQR para detectar o QR code
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
  
      if (qrCode) {
        // QR code detectado
        handleVoucherSubmit(qrCode.data);
        stopCamera();
      } else {
        // Continuar tentando detectar o QR code
        requestAnimationFrame(detectQRCode);
      }
    }
  }, [isScanning, handleVoucherSubmit, stopCamera]);

  // Redeem voucher
  const handleRedeem = async () => {
    if (!voucherData) return;
    
    setIsProcessing(true);
    try {
      // Simulate redemption API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVoucherData({ ...voucherData, status: 'used', redemptions: 1 });
      setSuccess('Voucher redeemed successfully!');
    } catch (error) {
      setError('Failed to redeem voucher. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setVoucherData(null);
    setError('');
    setSuccess('');
    setManualCode('');
    stopCamera();
  };

  // Start QR detection simulation when camera starts
  useEffect(() => {
    if (isScanning) {
      detectQRCode();
    }
  }, [isScanning, detectQRCode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-4">
            <Ticket className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-white font-bold text-2xl text-center">Voucher Portal</h1>
          <p className="text-white text-center mt-1">Scan or enter voucher code to redeem</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {!voucherData ? (
            <>
              {/* Mode Selection */}
              <div className="flex justify-center mb-6">
                <div className="bg-white rounded-lg p-1 shadow-sm border">
                  <Button
                    variant={scanMode === 'qr' ? "default" : "ghost"}
                    className={`mr-1 ${scanMode === 'qr' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    onClick={() => {
                      setScanMode('qr');
                      setError('');
                      stopCamera();
                    }}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Scanner
                  </Button>
                  <Button
                    variant={scanMode === 'manual' ? "default" : "ghost"}
                    className={scanMode === 'manual' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    onClick={() => {
                      setScanMode('manual');
                      setError('');
                      stopCamera();
                    }}
                  >
                    <Keyboard className="w-4 h-4 mr-2" />
                    Manual Entry
                  </Button>
                </div>
              </div>

              {/* QR Scanner Mode */}
              {scanMode === 'qr' && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Scan className="w-5 h-5 mr-2" />
                      QR Code Scanner
                    </CardTitle>
                    <CardDescription>
                      Point your camera at the voucher QR code to scan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!isScanning ? (
                      <div className="text-center space-y-4">
                        <div className="w-64 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Camera preview will appear here</p>
                          </div>
                        </div>
                        <Button 
                          onClick={startCamera} 
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={cameraPermission === 'denied'}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Start Camera
                        </Button>
                        {cameraPermission === 'denied' && (
                          <p className="text-sm text-red-600">
                            Camera access is required for QR scanning. Please enable camera permissions or use manual entry.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="relative w-64 h-48 mx-auto bg-black rounded-lg overflow-hidden">
                          <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            autoPlay
                            playsInline
                            muted
                          />
                          <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
                            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-500"></div>
                            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-500"></div>
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-500"></div>
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-500"></div>
                          </div>
                          {isProcessing && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <LoaderCircle className="w-8 h-8 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 justify-center">
                          <Button 
                            onClick={stopCamera} 
                            variant="outline"
                          >
                            Stop Camera
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">
                          {isProcessing ? 'Processing voucher...' : 'Position QR code within the frame'}
                        </p>
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </CardContent>
                </Card>
              )}

              {/* Manual Entry Mode */}
              {scanMode === 'manual' && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Keyboard className="w-5 h-5 mr-2" />
                      Manual Code Entry
                    </CardTitle>
                    <CardDescription>
                      Enter the voucher code manually
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="voucherCode">Voucher Code</Label>
                        <Input
                          id="voucherCode"
                          type="text"
                          placeholder="Enter voucher code (e.g., GIFT2024ABC123)"
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                          className="text-center text-lg font-mono"
                          disabled={isProcessing}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && manualCode.trim()) {
                              handleManualSubmit(e);
                            }
                          }}
                        />
                      </div>
                      <Button 
                        onClick={handleManualSubmit}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={isProcessing || !manualCode.trim()}
                      >
                        {isProcessing ? (
                          <>
                            <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Scan className="w-4 h-4 mr-2" />
                            Validate Voucher
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* Voucher Details Display */
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Voucher Details
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    voucherData.status === 'active' ? 'bg-green-100 text-green-800' :
                    voucherData.status === 'used' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {voucherData.status.toUpperCase()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Voucher Name</Label>
                    <p className="font-semibold">{voucherData.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Code</Label>
                    <p className="font-mono font-semibold">{voucherData.code}</p>
                  </div>
                  {voucherData.amount && (
                    <div>
                      <Label className="text-sm text-gray-600">Value</Label>
                      <p className="font-semibold text-lg">
                        {voucherData.currency}{voucherData.amount}
                      </p>
                    </div>
                  )}
                  {voucherData.expiryDate && (
                    <div>
                      <Label className="text-sm text-gray-600">Expires</Label>
                      <p className="font-semibold">
                        {new Date(voucherData.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                {voucherData.description && (
                  <div>
                    <Label className="text-sm text-gray-600">Description</Label>
                    <p>{voucherData.description}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm text-gray-600">Usage</Label>
                  <p>{voucherData.redemptions} of {voucherData.totalRedemptions} redemptions used</p>
                </div>
              </CardContent>
              <CardFooter className="flex space-x-2">
                {voucherData.status === 'active' && (
                  <Button 
                    onClick={handleRedeem} 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                        Redeeming...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Redeem Voucher
                      </>
                    )}
                  </Button>
                )}
                <Button 
                  onClick={handleReset} 
                  variant="outline" 
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Scan Another
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4 flex items-center">
              <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {/* Help Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use QR Scanner to scan voucher QR codes with your camera</li>
                <li>• Use Manual Entry to type in voucher codes directly</li>
                <li>• Valid vouchers will show details and redemption options</li>
                <li>• Try codes like "GIFT2024ABC123" or "TEST123" for demo</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}