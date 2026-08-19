import QRCode from 'qrcode'

export async function create_footer_qr(value: string) {
  const svg = await QRCode.toString(value, {
    color: {
      dark: '#000000',
      light: '#0000',
    },
    errorCorrectionLevel: 'M',
    margin: 0,
    type: 'svg',
  })

  return svg.replace('stroke="#000000"', 'stroke="currentColor"')
}
