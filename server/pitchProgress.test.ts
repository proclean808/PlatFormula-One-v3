import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import PitchProgress from "../client/src/components/PitchProgress";
import { pitchWorkflowState, pitchSectionProgress } from "../shared/pitchProgress";
beforeAll(()=>vi.stubGlobal("React",React));
afterAll(()=>vi.unstubAllGlobals());
const empty={brief:"",generating:false,hasDraft:false,applied:false,hasExistingSlides:false};
describe("pitch workflow and position indicators",()=>{
 it("starts at Brief and advances to Generate only with enough context",()=>{expect(pitchWorkflowState(empty).index).toBe(0);expect(pitchWorkflowState({...empty,brief:"Useful founder context"}).index).toBe(1);});
 it("generation is indeterminate and never represented as a made-up completion percentage",()=>{const state=pitchWorkflowState({...empty,generating:true,hasDraft:true,applied:true});expect(state.index).toBe(1);expect(state.message).toContain("indeterminate");expect(state).not.toHaveProperty("percentage");});
 it("draft and application select review and preview states",()=>{expect(pitchWorkflowState({...empty,hasDraft:true}).index).toBe(2);expect(pitchWorkflowState({...empty,applied:true}).index).toBe(3);});
 it("restored slides do not claim factual validation",()=>{expect(pitchWorkflowState({...empty,hasExistingSlides:true}).message).toContain("not verified");});
 it("counts only nonempty canonical sections and tracks first/last slide",()=>{expect(pitchSectionProgress({problem:"Fact",solution:" ",unexpected:"ignored"},"problem")).toMatchObject({position:1,total:10,populated:1});expect(pitchSectionProgress({},"product").position).toBe(10);expect(pitchSectionProgress({},"unknown").position).toBe(1);});
 it("renders accessible current step and slide-position progress attributes",()=>{const html=renderToStaticMarkup(React.createElement(PitchProgress,{brief:"",generating:false,hasDraft:false,applied:false,slides:{problem:"Draft"},activeSlide:"solution"}));expect(html).toContain('aria-current="step"');expect(html).toContain('role="progressbar"');expect(html).toContain('aria-valuenow="2"');expect(html).toContain('aria-valuemax="10"');expect(html).toContain('scaleX(0.2)');expect(html).toContain('not factual validation');expect(html).not.toContain('lucide-check');});
});
