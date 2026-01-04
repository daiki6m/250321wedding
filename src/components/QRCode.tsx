import QRCode from "react-qr-code";

interface QRCodeProps {
    url: string;
    size?: number;
}

export const UploadQRCode = ({ url, size = 128 }: QRCodeProps) => {
    return (
        <div className="bg-white p-2 rounded-lg shadow-lg inline-block">
            <QRCode
                size={size}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={url}
                viewBox={`0 0 256 256`}
            />
        </div>
    );
};
