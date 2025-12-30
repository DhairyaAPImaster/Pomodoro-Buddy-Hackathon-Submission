import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, TreePine, Flower as FlowerIcon } from 'lucide-react';

interface ForestGrowthProps {
  completedSessions: number;
  isActive: boolean;
  currentSession: 'work' | 'break' | 'longBreak';
}

export const ForestGrowth: React.FC<ForestGrowthProps> = ({
  completedSessions,
  isActive,
  currentSession
}) => {
  // Calculate forest elements based on completed sessions (faster growth)
  const getForestElements = () => {
    const seedlings = Math.min(completedSessions, 3);
    const smallTrees = Math.max(0, Math.min(completedSessions - 2, 4));
    const largeTrees = Math.max(0, Math.min(completedSessions - 5, 3));
    const flowers = Math.max(0, Math.min(completedSessions - 7, 6));

    return { seedlings, smallTrees, largeTrees, flowers };
  };

  const { seedlings, smallTrees, largeTrees, flowers } = getForestElements();

  // Tree component
  const Tree: React.FC<{ 
    size: 'small' | 'medium' | 'large'; 
    index: number;
    delay?: number;
  }> = ({ size, index, delay = 0 }) => {
    const baseSize = size === 'small' ? 'h-8 w-6' : size === 'medium' ? 'h-12 w-8' : 'h-16 w-10';
    const glowEffect = isActive && currentSession === 'work' ? 'animate-pulse-glow' : '';
    
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          delay: delay + index * 0.1,
          duration: 0.8,
          type: "spring",
          bounce: 0.4
        }}
        className={`${baseSize} flex flex-col items-center justify-end ${glowEffect}`}
      >
        {/* Tree Crown */}
        <motion.div
          animate={{ rotate: isActive ? [-2, 2, -2] : 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`
            ${size === 'small' ? 'w-4 h-5' : size === 'medium' ? 'w-6 h-7' : 'w-8 h-10'}
            bg-gradient-growth rounded-full shadow-glow-success
            relative overflow-hidden
          `}
        >
          {/* Leaves sparkle effect */}
          {isActive && (
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-tree-bright to-transparent opacity-30"
            />
          )}
        </motion.div>
        
        {/* Tree Trunk */}
        <div 
          className={`
            ${size === 'small' ? 'w-1 h-2' : size === 'medium' ? 'w-1.5 h-3' : 'w-2 h-4'}
            bg-tree-trunk rounded-sm
          `}
        />
      </motion.div>
    );
  };

  // Flower component
  const Flower: React.FC<{ index: number }> = ({ index }) => (
    <motion.div
      initial={{ scale: 0, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      transition={{
        delay: index * 0.15,
        duration: 0.6,
        type: "spring"
      }}
      className="relative"
    >
      <motion.div
        animate={{ 
          rotate: isActive ? [0, 5, -5, 0] : 0,
          scale: isActive ? [1, 1.05, 1] : 1
        }}
        transition={{ duration: 2, repeat: Infinity }}
        >
          <FlowerIcon className="w-4 h-4 text-tree-bright animate-float" />
        </motion.div>
    </motion.div>
  );

  return (
    <Card className="p-6 shadow-forest bg-gradient-forest border-forest-light h-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Leaf className="w-5 h-5 text-tree-bright" />
            Your Forest
          </h3>
          <Badge variant="outline" className="border-tree-bright text-tree-bright">
            {completedSessions} Sessions
          </Badge>
        </div>

        {/* Forest Visualization */}
        <div 
          className="relative bg-forest-dark rounded-lg p-6 min-h-[300px] overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, hsl(var(--moss-green)) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, hsl(var(--earth-brown)) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, hsl(var(--forest-medium)) 0%, transparent 50%)
            `
          }}
        >
          {/* Visible ground layer */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-earth-brown to-transparent" />
          
          {/* No sessions state */}
          {completedSessions === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center text-muted-foreground">
                <TreePine className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Start your first session to plant a seed!</p>
              </div>
            </motion.div>
          )}

          {/* Forest Grid */}
          <div className="relative h-full">
            {/* Back row - Large trees */}
            <div className="absolute top-4 left-0 right-0 flex justify-around items-end">
              {Array.from({ length: largeTrees }).map((_, i) => (
                <Tree key={`large-${i}`} size="large" index={i} delay={1.8} />
              ))}
            </div>

            {/* Middle row - Medium trees */}
            <div className="absolute top-16 left-0 right-0 flex justify-around items-end">
              {Array.from({ length: smallTrees }).map((_, i) => (
                <Tree key={`medium-${i}`} size="medium" index={i} delay={1.2} />
              ))}
            </div>

            {/* Front row - Seedlings */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-around items-end">
              {Array.from({ length: seedlings }).map((_, i) => (
                <Tree key={`small-${i}`} size="small" index={i} delay={0.6} />
              ))}
            </div>

            {/* Flowers scattered around */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-around items-end">
              {Array.from({ length: flowers }).map((_, i) => (
                <Flower key={`flower-${i}`} index={i} />
              ))}
            </div>

            {/* Active session glow effect */}
            {isActive && currentSession === 'work' && (
              <motion.div
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-t from-tree-bright/10 to-transparent rounded-lg"
              />
            )}
          </div>
        </div>

        {/* Growth Progress */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-tree-bright">{seedlings}/8</div>
              <div className="text-muted-foreground">Seedlings</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-primary">{smallTrees}/6</div>
              <div className="text-muted-foreground">Young Trees</div>
            </div>
          </div>

          {completedSessions > 14 && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-accent">{largeTrees}/4</div>
                <div className="text-muted-foreground">Mature Trees</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-tree-bright">{flowers}/8</div>
                <div className="text-muted-foreground">Flowers</div>
              </div>
            </div>
          )}

          {/* Motivational messages */}
          <div className="text-center text-sm text-muted-foreground pt-2 border-t border-forest-light">
            {completedSessions === 0 && "Plant your first seed! 🌱"}
            {completedSessions >= 1 && completedSessions < 5 && "Your forest is sprouting! 🌿"}
            {completedSessions >= 5 && completedSessions < 10 && "Beautiful growth! Keep going! 🌳"}
            {completedSessions >= 10 && completedSessions < 20 && "A thriving forest emerges! 🌲"}
            {completedSessions >= 20 && "You've created a magnificent forest! 🌲🌸"}
          </div>
        </div>
      </div>
    </Card>
  );
};