
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, LayoutList, Book, Search } from 'lucide-react';

interface DocumentStatsProps {
  stats: {
    documentCount: number;
    chapterCount: number;
    sectionCount: number;
    searchCount: number;
  };
}

const DocumentStats: React.FC<DocumentStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.documentCount}</div>
          <p className="text-xs text-muted-foreground">Indexed documents</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chapters</CardTitle>
          <Book className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.chapterCount}</div>
          <p className="text-xs text-muted-foreground">Total chapters</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sections</CardTitle>
          <LayoutList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.sectionCount}</div>
          <p className="text-xs text-muted-foreground">Total sections</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Searches</CardTitle>
          <Search className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.searchCount}</div>
          <p className="text-xs text-muted-foreground">Performed searches</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentStats;
