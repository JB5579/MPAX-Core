// 1. Install the package
// npm install react-masonry-css

// 2. Use it in a component
import Masonry from 'react-masonry-css';
import { ProjectCreationProgressCard } from './ProjectCreationProgressCard'; // Your card component

const MyMasonryGrid = ({ items }) => {
  // Define responsive breakpoints for columns
  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex -ml-4 w-auto" // Masonry's required class structure
      columnClassName="pl-4 bg-clip-padding" // Style the grid columns
    >
      {items.map((item) => (
        // Your custom card, with all its animations and styles
        <div key={item.id} className="mb-4"> {/* Add margin bottom for gap */}
          <ProjectCreationProgressCard progressData={item} />
        </div>
      ))}
    </Masonry>
  );
};