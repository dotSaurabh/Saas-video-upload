"use client";
import React, { useCallback, useState, useEffect } from "react";
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { Download, Clock, FileDown, FileUp } from "lucide-react";
import dayjs from "dayjs";
import realtiveTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";
import { Video } from "@prisma/client";

dayjs.extend(realtiveTime);

interface VideoCardProps {
  videos: Video;
  onDownload: (Url: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ videos, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // getting the url for the thumbnail for the card
  const getThumbnail = useCallback((publicId: string) => {
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 225,
      crop: "fill",
      gravity: "auto",
      format: "jpg",
      quality: "auto",
      assetType: "video",
    });
  }, []); // when dependecy array is empty then then it will remain same after mounting

  // here we are fetching the full url of video from cloundinary
  const getFullVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 1920,
      height: 1080,
    });
  }, []);

  // here we are fetching the url for the video preview
  const getPreviewVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 400,
      height: 225,
      rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"],
    });
  }, []);

  // here we are fetching the file size

  const formatSize = useCallback((size: number) => {
    return filesize(size);
  }, []);

  // here calculating the duartion of the video
  const formatDuration = useCallback((second: number) => {
    const minutes = Math.floor(second / 60); // here we get dividend
    const remainingSecond = Math.round(second % 60); // here we get remainder
    return `${minutes}:${remainingSecond.toString().padStart(2, "0")}`; // padstart put zero when it is single digit
  }, []);

  // here we are calculating the compression percentage

  const compressionPercentage = Math.round(
    1 - (Number(videos.compressedSize) / Number(videos.orginalSize)) * 100
  );

  // here we are handling the error for the preview
  useEffect(() => {
    setPreviewError(false);
  }, [isHovered]);

  // here we are handling the error for the preview
  const handlePreviewError = () => {
    setPreviewError(true);
  };

  return (
    <div
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <figure className="relative aspect-video">
        {/* Video thumbnail or preview */}
        {isHovered ? (
          previewError ? (
            // Error message if preview fails to load
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-red-500">Error loading preview</p>
            </div>
          ) : (
            // Video preview when hovered
            <video
              src={getPreviewVideoUrl(videos.publicId)}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              onError={handlePreviewError}
            />
          )
        ) : (
          // Static thumbnail when not hovered
          <img
            src={getThumbnail(videos.publicId)}
            alt={videos.title}
            className="w-full h-full object-cover"
          />
        )}
        {/* Video duration overlay */}
        <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
          <Clock size={16} className="mr-1" />
          {formatDuration(videos.duration)}
        </div>
      </figure>
      <div className="card-body p-4">
        {/* Video title and description */}
        <h2 className="card-title text-lg font-bold">{videos.title}</h2>
        <p className="text-sm text-base-content opacity-70 mb-4">
          {videos.description}
        </p>
        <p className="text-sm text-base-content opacity-70 mb-4">
          Uploaded {dayjs(videos.createdAt).fromNow()}
        </p>
        {/* File size information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <FileUp size={18} className="mr-2 text-primary" />
            <div>
              <div className="font-semibold">Original</div>
              <div>{formatSize(Number(videos.orginalSize))}</div>
            </div>
          </div>
          <div className="flex items-center">
            <FileDown size={18} className="mr-2 text-secondary" />
            <div>
              <div className="font-semibold">Compressed</div>
              <div>{formatSize(Number(videos.compressedSize))}</div>
            </div>
          </div>
        </div>
        {/* Compression percentage and download button */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm font-semibold">
            Compression:{" "}
            <span className="text-accent">{compressionPercentage}%</span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              onDownload(getFullVideoUrl(videos.publicId), videos.title)
            }
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
