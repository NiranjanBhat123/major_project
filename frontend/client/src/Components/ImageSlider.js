
import React, { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { styled } from '@mui/system';


const ImageSliderSection = styled(Box)(({ theme }) => ({
  width: '100vw',
  backgroundColor: '#f0f4f8',
  padding: theme.spacing(4),
  display: 'flex',
  justifyContent: 'center',
  boxSizing: 'border-box',
  overflow: 'hidden',
}));

const ImageSliderContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  maxWidth: '1400px',
  height: '45vh',
  overflow: 'hidden',
  borderRadius: '16px',
  backgroundColor: '#e8eef5',
  '&:hover .slider-controls': {
    opacity: 1,
  },
});

const SlideWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  transition: 'transform 0.5s ease-in-out',
}));

const SlideContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  width: '100%',
  boxSizing: 'border-box',
  flex: '0 0 100%',
}));

const ImageCard = styled(Box)(({ theme }) => ({
  flex: '0 0 calc(33.333% - 16px)',
  height: 'calc(45vh - 48px)',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  position: 'relative',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
  },
}));

const StyledImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const SliderButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: theme.palette.primary.main,
  zIndex: 2,
  opacity: 0,
  transition: 'all 0.3s ease',
  width: '48px',
  height: '48px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    transform: 'translateY(-50%) scale(1.1)',
  },
  '&.left': {
    left: 0,
    borderRadius: '0 8px 8px 0',
  },
  '&.right': {
    right: 0,
    borderRadius: '8px 0 0 8px',
  },
  '&.disabled': {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    color: 'rgba(0, 0, 0, 0.26)',
    cursor: 'not-allowed',
  },
}));

const images = [
 'https://thumbor.forbes.com/thumbor/fit-in/900x510/https://www.forbes.com/home-improvement/wp-content/uploads/2022/09/featured-image-plumbing.jpeg.jpg',
  'https://www.capitalhomeelectrical.com.au/wp-content/uploads/2021/07/electrical-repair.jpg',
  'https://cdn.prod.website-files.com/60eece3229f951ea48ce43b4/6638df8d1ce1f556221e1c05_how-often-should-you-clean-everything-in-your-house.webp',
  'https://images.squarespace-cdn.com/content/v1/5f4fdc32f4dacb6dc0cac51c/1620949301795-U6S42YRZSPW4ARV3NLV0/carpentry+image.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZDpoeGccbG_AU08Z5sBORy7c-jEUXBi4I5tutSZ5bOtg09EG2HO3JrDjrnEW2DIMNW_Y&usqp=CAU',
  'https://5.imimg.com/data5/SELLER/Default/2020/10/BH/XQ/SQ/96321959/home-painting-services-500x500.jpg',
  'https://www.shutterstock.com/image-photo/working-man-plumber-repairs-washing-600nw-1051194281.jpg',
  'https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg',
];

const ImageSlider = () => {
  const [currentGroup, setCurrentGroup] = useState(0);
  const imagesPerGroup = 3;
  const totalGroups = Math.ceil(images.length / imagesPerGroup);
  
  const imageGroups = Array.from({ length: totalGroups }, (_, i) =>
    images.slice(i * imagesPerGroup, (i + 1) * imagesPerGroup)
  );

  const handleNext = () => {
    if (currentGroup < totalGroups - 1) {
      setCurrentGroup(prev => prev + 1);
    } else {
      setCurrentGroup(0); // Loop back to the start
    }
  };

  const handlePrev = () => {
    if (currentGroup > 0) {
      setCurrentGroup(prev => prev - 1);
    } else {
      setCurrentGroup(totalGroups - 1); // Loop back to the last
    }
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval); // Clear interval on unmount
  }, [currentGroup]);

  return (
    <>
    <ImageSliderSection>
      <ImageSliderContainer>
        <SliderButton 
          onClick={handlePrev} 
          className={`slider-controls left ${currentGroup === 0 ? 'disabled' : ''}`}
          disabled={currentGroup === 0}
          size="large"
        >
          <ChevronLeftIcon sx={{ fontSize: 32 }} />
        </SliderButton>
        
        <SlideWrapper
          className="slide-wrapper"
          sx={{
            transform: `translateX(-${currentGroup * 100}%)`,
          }}
        >
          {imageGroups.map((group, groupIndex) => (
            <SlideContainer key={groupIndex}>
              {group.map((image, index) => (
                image && (
                  <ImageCard key={`${groupIndex}-${index}`}>
                    <StyledImage
                      src={image}
                      alt={`Slide ${groupIndex * imagesPerGroup + index + 1}`}
                      loading="lazy"
                    />
                  </ImageCard>
                )
              ))}
            </SlideContainer>
          ))}
        </SlideWrapper>

        <SliderButton 
          onClick={handleNext} 
          className={`slider-controls right ${currentGroup === totalGroups - 1 ? 'disabled' : ''}`}
          disabled={currentGroup === totalGroups - 1}
          size="large"
        >
          <ChevronRightIcon sx={{ fontSize: 32 }} />
        </SliderButton>
      </ImageSliderContainer>
    </ImageSliderSection>
    </>
  );

};

export default ImageSlider;



