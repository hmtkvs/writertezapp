import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Book, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';

// Define section type to build the tree structure
interface Section {
  id: string;
  title: string;
  count: number;
  level: number;
  children: Section[];
}

// Define chapter with sections for tree structure
interface ChapterWithSections {
  name: string;
  sectionCount: number;
  sections: Section[];
}

// Track chapter result counts
interface ChapterCounts {
  [chapterName: string]: number;
}

interface ChaptersListProps {
  chapters: Array<string | { name: string; sectionCount: number }>;
  selectedChapters: string[];
  onSelectChapters: (chapters: string[]) => void;
  searchResults?: any[]; // Optional search results to enhance accuracy of counts
}

const ChaptersList: React.FC<ChaptersListProps> = ({
  chapters = [],
  selectedChapters = [],
  onSelectChapters,
  searchResults = [],
}) => {
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [chapterCounts, setChapterCounts] = useState<ChapterCounts>({});

  // Calculate chapter counts when search results change
  useEffect(() => {
    if (!searchResults || searchResults.length === 0) {
      // Reset counts to default if no search results
      const defaultCounts: ChapterCounts = {};
      chapters.forEach(chapter => {
        const chapterName = getChapterName(chapter);
        defaultCounts[chapterName] = typeof chapter === 'object' ? chapter.sectionCount : 0;
      });
      setChapterCounts(defaultCounts);
      return;
    }

    // Calculate counts for each chapter based on all search results
    const counts: ChapterCounts = {};
    
    // Initialize with zeros
    chapters.forEach(chapter => {
      counts[getChapterName(chapter)] = 0;
    });
    
    // Count results by chapter
    searchResults.forEach(result => {
      if (
        result.metadata && 
        result.metadata.parent_titles && 
        result.metadata.parent_titles.length > 0
      ) {
        const chapterName = result.metadata.parent_titles[0];
        counts[chapterName] = (counts[chapterName] || 0) + 1;
      }
    });
    
    setChapterCounts(counts);
  }, [searchResults, chapters]);

  // Get chapter name safely regardless of whether it's a string or object
  const getChapterName = (chapter: string | { name: string; sectionCount: number }): string => {
    return typeof chapter === 'string' ? chapter : chapter.name;
  };

  // Count total available chapters
  const chapterNames = chapters.map(getChapterName);
  
  // Toggle expand/collapse of a chapter
  const toggleChapterExpand = (chapterName: string) => {
    setExpandedChapters(prev => 
      prev.includes(chapterName) 
        ? prev.filter(c => c !== chapterName) 
        : [...prev, chapterName]
    );
  };

  // Toggle expand/collapse of a section
  const toggleSectionExpand = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(s => s !== sectionId) 
        : [...prev, sectionId]
    );
  };

  // Handle chapter selection
  const handleChapterToggle = (chapterName: string) => {
    if (selectedChapters.includes(chapterName)) {
      onSelectChapters(selectedChapters.filter(c => c !== chapterName));
      
      // Also remove any selected sections from this chapter
      const sectionPrefix = `${chapterName}:`;
      setSelectedSections(prev => prev.filter(s => !s.startsWith(sectionPrefix)));
    } else {
      onSelectChapters([...selectedChapters, chapterName]);
    }
  };

  // Handle section selection
  const handleSectionToggle = (chapterName: string, sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullSectionId = `${chapterName}:${sectionId}`;
    
    setSelectedSections(prev => 
      prev.includes(fullSectionId)
        ? prev.filter(s => s !== fullSectionId)
        : [...prev, fullSectionId]
    );
    
    // Check if chapter should be selected based on section selection
    const isChapterSelected = selectedChapters.includes(chapterName);
    const shouldSelectChapter = !isChapterSelected && !selectedSections.some(s => s.startsWith(`${chapterName}:`));
    
    if (shouldSelectChapter) {
      onSelectChapters([...selectedChapters, chapterName]);
    }
  };

  // Handle subsection selection
  const handleSubsectionToggle = (chapterName: string, sectionId: string, subsectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullSubsectionId = `${chapterName}:${sectionId}:${subsectionId}`;
    
    setSelectedSections(prev => 
      prev.includes(fullSubsectionId)
        ? prev.filter(s => s !== fullSubsectionId)
        : [...prev, fullSubsectionId]
    );
    
    // Check if parent chapter should be selected
    const isChapterSelected = selectedChapters.includes(chapterName);
    const shouldSelectChapter = !isChapterSelected && !selectedSections.some(s => s.startsWith(`${chapterName}:`));
    
    if (shouldSelectChapter) {
      onSelectChapters([...selectedChapters, chapterName]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedChapters.length === chapterNames.length) {
      onSelectChapters([]);
      setSelectedSections([]);
    } else {
      onSelectChapters([...chapterNames]);
    }
  };

  // Order chapters according to thesis structure
  const orderChapters = (chapterList: Array<string | { name: string; sectionCount: number }>) => {
    const chapterOrder = [
      'Introduction',
      'Background',
      'State of the Art',
      'Enhancing Job Posting Classification with Multilingual Embeddings and Large Language Models',
      'Job Offer and Applicant CV Classification Using Rich Information from a Labour Market Taxonomy',
      'Using Large Language Models and Recruiter Expertise for Optimized Multilingual Job Offer -- Applicant CV Matching',
      'Multilingual Skill Extraction for Job Vacancy--Job Seeker Matching in Knowledge Graphs',
      'Conclusions and Future Work',
      'Abbreviations'
    ];
    
    return [...chapterList].sort((a, b) => {
      const aName = getChapterName(a);
      const bName = getChapterName(b);
      const aIndex = chapterOrder.indexOf(aName);
      const bIndex = chapterOrder.indexOf(bName);
      
      // If both chapters are in the order list, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only one is in the order list, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // If neither is in the list, sort alphabetically
      return aName.localeCompare(bName);
    });
  };

  // Get chapter result count from our stable count state
  const getChapterResultCount = (chapterName: string): number => {
    return chapterCounts[chapterName] || 0;
  };

  // Check if a section is selected
  const isSectionSelected = (chapterName: string, sectionId: string): boolean => {
    return selectedSections.includes(`${chapterName}:${sectionId}`);
  };

  // Check if a subsection is selected
  const isSubsectionSelected = (chapterName: string, sectionId: string, subsectionId: string): boolean => {
    return selectedSections.includes(`${chapterName}:${sectionId}:${subsectionId}`);
  };

  // Mock sections for demonstration (in real app, these would come from API)
  const getMockSections = (chapterName: string): Section[] => {
    // This would be replaced with actual section data from the API
    const sectionCounts = {
      'Introduction': [
        { id: '1.1', title: 'Motivation', count: 1, level: 1, children: [] },
        { id: '1.2', title: 'Research Questions', count: 1, level: 1, children: [] },
        { id: '1.3', title: 'Thesis Structure', count: 1, level: 1, children: [] }
      ],
      'Background': [
        { id: '2.1', title: 'Labour Market Context', count: 2, level: 1, children: [] },
        { id: '2.2', title: 'Skills and Competencies', count: 3, level: 1, children: [
          { id: '2.2.1', title: 'Skill Taxonomies', count: 1, level: 2, children: [] },
          { id: '2.2.2', title: 'Competency Frameworks', count: 1, level: 2, children: [] }
        ] },
        { id: '2.3', title: 'Multilingual Challenges', count: 2, level: 1, children: [] }
      ],
      'State of the Art': [
        { id: '3.1', title: 'Current Approaches', count: 2, level: 1, children: [] },
        { id: '3.2', title: 'Research Gaps', count: 1, level: 1, children: [] }
      ],
      'Conclusions and Future Work': [
        { id: '8.1', title: 'Summary of Contributions', count: 1, level: 1, children: [] },
        { id: '8.2', title: 'Future Research Directions', count: 1, level: 1, children: [] }
      ]
    };
    
    return sectionCounts[chapterName as keyof typeof sectionCounts] || [];
  };

  const orderedChapters = orderChapters(chapters);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Book className="h-4 w-4" />
          Chapters
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-4 py-2">
            <Checkbox
              id="select-all"
              checked={chapterNames.length > 0 && selectedChapters.length === chapterNames.length}
              onCheckedChange={handleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select All Chapters
            </label>
          </div>
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="space-y-1">
              {orderedChapters.map((chapter, index) => {
                const chapterName = getChapterName(chapter);
                const isExpanded = expandedChapters.includes(chapterName);
                const sections = getMockSections(chapterName);
                const resultCount = getChapterResultCount(chapterName);
                
                return (
                  <div key={`${chapterName}-${index}`} className="space-y-1">
                    <div 
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-accent cursor-pointer"
                      onClick={() => toggleChapterExpand(chapterName)}
                    >
                      {sections.length > 0 ? (
                        isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                      ) : (
                        <div className="w-4" />
                      )}
                      <Checkbox
                        id={chapterName}
                        checked={selectedChapters.includes(chapterName)}
                        onCheckedChange={() => handleChapterToggle(chapterName)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label
                        htmlFor={chapterName}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChapterToggle(chapterName);
                        }}
                      >
                        {chapterName}
                      </label>
                      {resultCount > 0 && (
                        <Badge variant="outline" className="ml-auto">{resultCount}</Badge>
                      )}
                    </div>
                    
                    {/* Render sections if chapter is expanded */}
                    {isExpanded && sections.length > 0 && (
                      <div className="ml-6 space-y-1">
                        {sections.map(section => {
                          const isSectionExpanded = expandedSections.includes(`${chapterName}:${section.id}`);
                          
                          return (
                            <div key={section.id} className="space-y-1">
                              <div 
                                className="flex items-center space-x-2 px-4 py-2 hover:bg-accent cursor-pointer"
                                onClick={(e) => section.children.length > 0 && toggleSectionExpand(`${chapterName}:${section.id}`, e)}
                              >
                                {section.children.length > 0 ? (
                                  isSectionExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
                                ) : (
                                  <div className="w-3" />
                                )}
                                <Checkbox
                                  id={`${chapterName}-${section.id}`}
                                  checked={isSectionSelected(chapterName, section.id)}
                                  onCheckedChange={() => {}}
                                  onClick={(e) => handleSectionToggle(chapterName, section.id, e)}
                                />
                                <label
                                  htmlFor={`${chapterName}-${section.id}`}
                                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSectionToggle(chapterName, section.id, e);
                                  }}
                                >
                                  {section.title}
                                </label>
                                {section.count > 0 && (
                                  <Badge variant="outline" className="ml-auto text-xs">{section.count}</Badge>
                                )}
                              </div>
                              
                              {/* Render subsections */}
                              {isSectionExpanded && section.children.length > 0 && (
                                <div className="ml-5 space-y-1">
                                  {section.children.map(subsection => (
                                    <div 
                                      key={subsection.id} 
                                      className="flex items-center space-x-2 px-4 py-2 hover:bg-accent cursor-pointer"
                                    >
                                      <div className="w-3" />
                                      <Checkbox
                                        id={`${chapterName}-${section.id}-${subsection.id}`}
                                        checked={isSubsectionSelected(chapterName, section.id, subsection.id)}
                                        onCheckedChange={() => {}}
                                        onClick={(e) => handleSubsectionToggle(chapterName, section.id, subsection.id, e)}
                                      />
                                      <label
                                        htmlFor={`${chapterName}-${section.id}-${subsection.id}`}
                                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSubsectionToggle(chapterName, section.id, subsection.id, e);
                                        }}
                                      >
                                        {subsection.title}
                                      </label>
                                      {subsection.count > 0 && (
                                        <Badge variant="outline" className="ml-auto text-xs">{subsection.count}</Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChaptersList;
