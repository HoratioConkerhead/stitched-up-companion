﻿import React, { useState, useEffect } from 'react';
const Timeline = ({ 
  onEventSelect, 
  selectedEvent,
  eventsData,
  charactersData,
  locationsData
}) => {
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [characterFilter, setCharacterFilter] = useState('all');
  const [layoutMode, setLayoutMode] = useState('chronological'); // 'chronological' or 'parallel'
  
  // Filter events based on selection
  const filteredEvents = eventsData.filter(event => {
    // Filter by time period
    const matchesTimePeriod = (() => {
      if (timelineFilter === 'all') return true;
      if (timelineFilter === 'early' && event.date.includes('193')) return true;
      if (timelineFilter === 'mid' && (event.date.includes('1941') || event.date.includes('1942'))) return true;
      if (timelineFilter === 'late' && (event.date.includes('1943') || event.date.includes('1944'))) return true;
      return false;
    })();
    
    // Filter by character
    const matchesCharacter = (() => {
      if (characterFilter === 'all') return true;
      if (!event.characters) return false;
      return event.characters.some(c => c.characterId === characterFilter);
    })();
    
    return matchesTimePeriod && matchesCharacter;
  });
  
  // Sort events chronologically
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    // Extract years or use default values for sorting
    const extractYear = (dateStr) => {
      const match = dateStr.match(/\d{4}/);
      return match ? parseInt(match[0]) : 1900;
    };
    
    const yearA = extractYear(a.date);
    const yearB = extractYear(b.date);
    
    if (yearA !== yearB) return yearA - yearB;
    
    // If years are the same, sort by month if available
    const monthOrder = {
      'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
      'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
    };
    
    const extractMonth = (dateStr) => {
      for (const month in monthOrder) {
        if (dateStr.includes(month)) return monthOrder[month];
      }
      return 0;
    };
    
    const monthA = extractMonth(a.date);
    const monthB = extractMonth(b.date);
    
    return monthA - monthB;
  });
  
  // Group events by year for visual organization
  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const year = event.date.match(/\d{4}/) ? event.date.match(/\d{4}/)[0] : 'Unknown';
    if (!groups[year]) groups[year] = [];
    groups[year].push(event);
    return groups;
  }, {});
  
  // For parallel storylines view, group by character faction
  const getCharacterGroup = (characterId) => {
    const character = charactersData.find(c => c.id === characterId);
    return character ? character.group : 'Unknown';
  };
  
  const parallelEvents = (() => {
    const groups = {
      'Protagonists': [],
      'Fifth Columnists': [],
      'German Connection': []
    };
    
    filteredEvents.forEach(event => {
      if (!event.characters) return;
      
      // Determine primary group for this event
      const characterGroups = event.characters.map(c => getCharacterGroup(c.characterId));
      const primaryGroup = (() => {
        if (characterGroups.includes('Protagonists') && characterGroups.includes('Fifth Columnists')) {
          // If both major groups are involved, check roles
          const protagonistRoles = event.characters
            .filter(c => getCharacterGroup(c.characterId) === 'Protagonists')
            .map(c => c.role || '');
          
          const isProtagonistFocused = protagonistRoles.some(role => 
            ['host', 'operative', 'recruiter', 'surveillance'].includes(role)
          );
          
          return isProtagonistFocused ? 'Protagonists' : 'Fifth Columnists';
        }
        
        if (characterGroups.includes('Protagonists')) return 'Protagonists';
        if (characterGroups.includes('Fifth Columnists')) return 'Fifth Columnists';
        if (characterGroups.includes('German Connection')) return 'German Connection';
        return 'Unknown';
      })();
      
      if (groups[primaryGroup]) groups[primaryGroup].push(event);
    });
    
    return groups;
  })();
  
  return (
    <div className="timeline-container">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Event Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <div className="flex">
              <button 
                className={`px-3 py-1 text-sm rounded-l ${timelineFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setTimelineFilter('all')}
              >
                All Events
              </button>
              <button 
                className={`px-3 py-1 text-sm ${timelineFilter === 'early' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setTimelineFilter('early')}
              >
                1932-1939
              </button>
              <button 
                className={`px-3 py-1 text-sm ${timelineFilter === 'mid' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setTimelineFilter('mid')}
              >
                1940-1942
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-r ${timelineFilter === 'late' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setTimelineFilter('late')}
              >
                1943-1944
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
            <div className="flex">
              <button 
                className={`px-3 py-1 text-sm rounded-l ${layoutMode === 'chronological' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setLayoutMode('chronological')}
              >
                Chronological
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-r ${layoutMode === 'parallel' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setLayoutMode('parallel')}
              >
                Parallel Storylines
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Character</label>
          <select 
            className="w-full md:w-auto p-2 border rounded"
            value={characterFilter}
            onChange={(e) => setCharacterFilter(e.target.value)}
          >
            <option value="all">All Characters</option>
            <optgroup label="Protagonists">
              {charactersData
                .filter(c => c.group === 'Protagonists')
                .map(character => (
                  <option key={character.id} value={character.id}>{character.name}</option>
                ))
              }
            </optgroup>
            <optgroup label="Fifth Columnists">
              {charactersData
                .filter(c => c.group === 'Fifth Columnists')
                .map(character => (
                  <option key={character.id} value={character.id}>{character.name}</option>
                ))
              }
            </optgroup>
            <optgroup label="German Connection">
              {charactersData
                .filter(c => c.group === 'German Connection')
                .map(character => (
                  <option key={character.id} value={character.id}>{character.name}</option>
                ))
              }
            </optgroup>
          </select>
        </div>
      </div>
      
      {/* Chronological Timeline View */}
      {layoutMode === 'chronological' && (
        <>
          <div className="overflow-x-auto mb-6">
            <div className="min-w-max">
              <div className="relative pb-10">
                <div className="absolute left-0 right-0 h-1 bg-gray-300 top-4"></div>
                <div className="flex">
                  {sortedEvents.map((event, index) => (
                    <div 
                      key={event.id} 
                      className="relative px-4"
                      onClick={() => onEventSelect(event)}
                    >
                      <div 
                        className={`w-4 h-4 rounded-full relative top-3 z-10 cursor-pointer ${
                          selectedEvent?.id === event.id 
                            ? 'bg-blue-600' 
                            : getEventColor(event, charactersData)
                        }`}
                      ></div>
                      <div className={`text-xs pt-6 w-24 text-center cursor-pointer transform -rotate-45 origin-top-left ${
                        selectedEvent?.id === event.id ? 'font-bold' : ''
                      }`}>
                        {event.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([year, events]) => (
              <div key={year} className="border-l-4 border-blue-200 pl-4">
                <h3 className="text-lg font-bold mb-2">{year}</h3>
                <div className="space-y-4">
                  {events.map(event => (
                    <div 
                      key={event.id}
                      className={`p-3 border rounded cursor-pointer hover:bg-gray-100 ${
                        selectedEvent?.id === event.id ? 'bg-blue-100 border-blue-300' : ''
                      }`}
                      onClick={() => onEventSelect(event)}
                    >
                      <div className="text-sm text-gray-600">{event.date}</div>
                      <h3 className="font-bold">{event.title}</h3>
                      <div className="text-sm mt-1 truncate">{event.description}</div>
                      <div className="flex mt-2">
                        {event.location && (
                          <span className="text-xs px-2 py-1 rounded bg-gray-200 mr-2">
                            {getLocationName(event.location, locationsData)}
                          </span>
                        )}
                        {event.characters && event.characters.length > 0 && (
                          <span className="text-xs px-2 py-1 rounded bg-gray-200">
                            {event.characters.length} characters
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Parallel Storylines View */}
      {layoutMode === 'parallel' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-blue-700 border-b pb-2">Protagonists</h3>
            {parallelEvents['Protagonists'].map(event => (
              <div 
                key={event.id}
                className={`p-3 border-l-4 border-blue-500 rounded shadow-sm cursor-pointer hover:bg-gray-100 ${
                  selectedEvent?.id === event.id ? 'bg-blue-100' : ''
                }`}
                onClick={() => onEventSelect(event)}
              >
                <div className="text-sm text-gray-600">{event.date}</div>
                <h3 className="font-bold">{event.title}</h3>
                <div className="text-sm mt-1 truncate">{event.description}</div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-red-700 border-b pb-2">Fifth Columnists</h3>
            {parallelEvents['Fifth Columnists'].map(event => (
              <div 
                key={event.id}
                className={`p-3 border-l-4 border-red-500 rounded shadow-sm cursor-pointer hover:bg-gray-100 ${
                  selectedEvent?.id === event.id ? 'bg-red-100' : ''
                }`}
                onClick={() => onEventSelect(event)}
              >
                <div className="text-sm text-gray-600">{event.date}</div>
                <h3 className="font-bold">{event.title}</h3>
                <div className="text-sm mt-1 truncate">{event.description}</div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-yellow-700 border-b pb-2">German Connection</h3>
            {parallelEvents['German Connection'].map(event => (
              <div 
                key={event.id}
                className={`p-3 border-l-4 border-yellow-500 rounded shadow-sm cursor-pointer hover:bg-gray-100 ${
                  selectedEvent?.id === event.id ? 'bg-yellow-100' : ''
                }`}
                onClick={() => onEventSelect(event)}
              >
                <div className="text-sm text-gray-600">{event.date}</div>
                <h3 className="font-bold">{event.title}</h3>
                <div className="text-sm mt-1 truncate">{event.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Event Details Panel */}
      {selectedEvent && (
        <div className="mt-8 border rounded p-6 bg-gray-50">
          <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
          <div className="text-gray-600 mb-4">{selectedEvent.date}</div>
          
          <p className="mb-4">{selectedEvent.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-2">Location</h3>
              <div className="p-3 bg-gray-100 rounded">
                {selectedEvent.location ? (
                  <div>
                    <div className="font-medium">{getLocationName(selectedEvent.location, locationsData)}</div>
                    <div className="text-sm text-gray-600">
                      {getLocationArea(selectedEvent.location, locationsData)}
                    </div>
                  </div>
                ) : (
                  <div>Multiple or unspecified locations</div>
                )}
              </div>
              
              {selectedEvent.significance && (
                <div className="mt-4">
                  <h3 className="font-bold text-lg mb-2">Significance</h3>
                  <div className="p-3 bg-gray-100 rounded">
                    {selectedEvent.significance}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-2">Key Characters</h3>
              {selectedEvent.characters && selectedEvent.characters.length > 0 ? (
                <div className="space-y-2">
                  {selectedEvent.characters.map((charRef, index) => {
                    const character = charactersData.find(c => c.id === charRef.characterId);
                    return character ? (
                      <div key={index} className="p-2 bg-gray-100 rounded flex items-center justify-between">
                        <div>
                          <span className="font-medium">{character.name}</span>
                          {charRef.role && (
                            <span className="ml-2 text-xs bg-blue-100 px-1 rounded">
                              {charRef.role}
                            </span>
                          )}
                          {charRef.disguise && (
                            <span className="ml-2 text-xs bg-purple-100 px-1 rounded">
                              as {charRef.disguise}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${getGroupColor(character.group)}`}>
                          {character.group}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="p-3 bg-gray-100 rounded">No character information available</div>
              )}
            </div>
          </div>
          
          {selectedEvent.keyActions && selectedEvent.keyActions.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-lg mb-2">Key Actions</h3>
              <ul className="list-disc pl-5 space-y-1">
                {selectedEvent.keyActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}
          
          {selectedEvent.chapter && (
            <div className="mt-4 text-sm text-gray-600">
              <span className="font-medium">Chapter reference:</span> {selectedEvent.chapter}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get location name from ID
const getLocationName = (locationId, locationsData) => {
  const location = locationsData.find(l => l.id === locationId);
  return location ? location.name : locationId;
};

// Helper function to get location area from ID
const getLocationArea = (locationId, locationsData) => {
  const location = locationsData.find(l => l.id === locationId);
  return location ? location.area : '';
};

// Helper function to get event color based on primary character group
const getEventColor = (event, charactersData) => {
  if (!event.characters || event.characters.length === 0) {
    return 'bg-gray-400';
  }
  
  const characterIds = event.characters.map(c => c.characterId);
  const characters = charactersData.filter(c => characterIds.includes(c.id));
  
  if (characters.some(c => c.group === 'Protagonists')) {
    return 'bg-blue-500';
  } else if (characters.some(c => c.group === 'Fifth Columnists')) {
    return 'bg-red-500';
  } else if (characters.some(c => c.group === 'German Connection')) {
    return 'bg-yellow-500';
  }
  
  return 'bg-gray-400';
};

// Helper function to get the CSS class for a character group
const getGroupColor = (group) => {
  switch (group) {
    case 'Protagonists':
      return 'bg-blue-200 text-blue-800';
    case 'Fifth Columnists':
      return 'bg-red-200 text-red-800';
    case 'German Connection':
      return 'bg-yellow-200 text-yellow-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

export default Timeline;

