"use client";

import React, { useState, useEffect } from 'react';

export default function EventStream() {
  const [events, setEvents] = useState([
    { id: 1, type: "cognitive.observe.started", time: "10:42:01", status: "success" },
    { id: 2, type: "cognitive.retrieve.started", time: "10:42:02", status: "success" },
    { id: 3, type: "cognitive.plan.started", time: "10:42:03", status: "success" },
    { id: 4, type: "human.approval.required", time: "10:42:04", status: "pending" },
  ]);

  return (
    <div className="space-y-3 font-mono text-sm">
      {events.map(event => (
        <div key={event.id} className="p-3 bg-neutral-900 rounded border border-neutral-700 flex items-center justify-between">
          <div>
            <span className="text-neutral-500 mr-3">[{event.time}]</span>
            <span className="text-neutral-300">{event.type}</span>
          </div>
          <span className={`px-2 py-1 text-xs rounded ${event.status === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
            {event.status}
          </span>
        </div>
      ))}
    </div>
  );
}
