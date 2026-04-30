Add-Type -AssemblyName System.Drawing

$brandDir = Join-Path (Get-Location) 'public\brand'
if (-not (Test-Path $brandDir)) { New-Item -ItemType Directory -Path $brandDir | Out-Null }

$gold = [System.Drawing.Color]::FromArgb(212, 175, 55)

function Draw-PinHeart {
  param([System.Drawing.Graphics]$g, [float]$cx, [float]$cy, [float]$size, [float]$stroke)

  $pinWidth = $size * 0.34
  $pinTop = $cy - ($size * 0.34)
  $tipY = $cy + ($size * 0.46)

  $pinPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $pinPath.AddBezier([float]$cx, [float]$pinTop, [float]($cx - ($pinWidth * 0.78)), [float]$pinTop, [float]($cx - $pinWidth), [float]($cy - ($size * 0.08)), [float]$cx, [float]$tipY)
  $pinPath.AddBezier([float]$cx, [float]$tipY, [float]($cx + $pinWidth), [float]($cy - ($size * 0.08)), [float]($cx + ($pinWidth * 0.78)), [float]$pinTop, [float]$cx, [float]$pinTop)

  $pinPen = New-Object System.Drawing.Pen($gold, $stroke)
  $pinPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $pinPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pinPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawPath($pinPen, $pinPath)

  $heartPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $hx = $cx
  $hy = $cy - ($size * 0.04)
  $h = $size * 0.18

  $heartPath.StartFigure()
  $heartPath.AddBezier([float]$hx, [float]($hy + ($h * 0.9)), [float]($hx - ($h * 1.05)), [float]$hy, [float]($hx - ($h * 0.9)), [float]($hy - ($h * 1.05)), [float]$hx, [float]($hy - ($h * 0.28)))
  $heartPath.AddBezier([float]$hx, [float]($hy - ($h * 0.28)), [float]($hx + ($h * 0.9)), [float]($hy - ($h * 1.05)), [float]($hx + ($h * 1.05)), [float]$hy, [float]$hx, [float]($hy + ($h * 0.9)))
  $heartPath.CloseFigure()

  $heartPen = New-Object System.Drawing.Pen($gold, [float]($stroke * 0.72))
  $heartPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $heartPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $heartPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawPath($heartPen, $heartPath)

  $pinPen.Dispose(); $heartPen.Dispose(); $pinPath.Dispose(); $heartPath.Dispose()
}

function New-LogoImage {
  param([int]$width, [int]$height, [bool]$withText, [bool]$blackBackground, [string]$outPath, [float]$iconScale = 1.0, [float]$textScale = 1.0)

  $bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  if ($blackBackground) { $g.Clear([System.Drawing.Color]::Black) } else { $g.Clear([System.Drawing.Color]::Transparent) }

  if ($withText) {
    $iconSize = [float]([Math]::Min($height * 0.66, $width * 0.26) * $iconScale)
    $iconCx = [float]($width / 2)
    $iconCy = [float]($height * 0.30)
    Draw-PinHeart -g $g -cx $iconCx -cy $iconCy -size $iconSize -stroke ([float][Math]::Max(3, $height * 0.03))

    $fontSize = [float]([Math]::Max(14, $height * 0.22 * $textScale))
    $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $brush = New-Object System.Drawing.SolidBrush($gold)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $x = [float]($width / 2)
    $y = [float]($height * 0.76)
    $g.DrawString('Casa-MX.com', $font, $brush, $x, $y, $format)

    $format.Dispose(); $brush.Dispose(); $font.Dispose()
  } else {
    $iconSize = [float]([Math]::Min($width, $height) * 0.78 * $iconScale)
    Draw-PinHeart -g $g -cx ([float]($width / 2)) -cy ([float]($height / 2)) -size $iconSize -stroke ([float][Math]::Max(3, $width * 0.05))
  }

  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

New-LogoImage -width 768 -height 256 -withText $true -blackBackground $false -outPath (Join-Path $brandDir 'logo-primary.png')
New-LogoImage -width 1536 -height 512 -withText $true -blackBackground $false -outPath (Join-Path $brandDir 'logo-primary@2x.png')
New-LogoImage -width 512 -height 512 -withText $false -blackBackground $false -outPath (Join-Path $brandDir 'logo-mark.png')
New-LogoImage -width 180 -height 180 -withText $false -blackBackground $false -outPath (Join-Path $brandDir 'apple-icon.png')
New-LogoImage -width 1200 -height 630 -withText $true -blackBackground $true -outPath (Join-Path $brandDir 'og-image.png') -iconScale 1.05 -textScale 1.05

$src = [System.Drawing.Bitmap]::FromFile((Join-Path $brandDir 'logo-mark.png'))
$iconBmp = New-Object System.Drawing.Bitmap(32, 32, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$ig = [System.Drawing.Graphics]::FromImage($iconBmp)
$ig.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$ig.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$ig.Clear([System.Drawing.Color]::Transparent)
$ig.DrawImage($src, 0, 0, 32, 32)

$pngStream = New-Object System.IO.MemoryStream
$iconBmp.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $pngStream.ToArray()

$icoPath = Join-Path $brandDir 'favicon.ico'
$fs = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
$bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]32); $bw.Write([Byte]32); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32)
$bw.Write([UInt32]$pngBytes.Length); $bw.Write([UInt32]22)
$bw.Write($pngBytes)
$bw.Close(); $fs.Close(); $pngStream.Close(); $ig.Dispose(); $iconBmp.Dispose(); $src.Dispose()
