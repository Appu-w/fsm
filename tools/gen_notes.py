#!/usr/bin/env python3
"""Generate the FSM exam notes (LaTeX), the Verilog RTL and the testbenches.

Every state diagram, step-by-step frame, trace table and waveform in the PDF
is produced from the same Python model of each FSM, and every model is
cross-checked against a brute-force reference before anything is written.

Usage:  python3 tools/gen_notes.py      (run from the repository root)
"""
import os
import random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC, RTL, TB = (os.path.join(ROOT, d) for d in ("doc", "rtl", "tb"))


# --------------------------------------------------------------------------
# FSM model
# --------------------------------------------------------------------------
class FSM:
    def __init__(self, kind, states, edges, table, moore_out=None,
                 out_short="det", reset="S0"):
        self.kind = kind            # 'moore' | 'mealy'
        self.states = states        # list of dicts: id, x, y, meaning, mpos, initial
        self.edges = edges          # list of (src, dst, label, edge_opts, node_opts)
        self.table = table          # {(state, input): next} or (next, out) for Mealy
        self.moore_out = moore_out or {}
        self.out_short = out_short
        self.reset = reset
        keys = {(e[0], e[1]) for e in edges}
        for (s, i), v in table.items():
            ns = v[0] if kind == "mealy" else v
            assert (s, ns) in keys, "missing edge %s->%s" % (s, ns)

    def step(self, s, i):
        v = self.table[(s, i)]
        if self.kind == "mealy":
            return v
        return v, self.moore_out[v]

    def mealy_now(self, s, i):
        """Combinational output while in state s with input i (Mealy)."""
        return self.table[(s, i)][1]

    def run(self, ins):
        s = self.reset
        states, dets = [s], []
        for i in ins:
            ns, d = self.step(s, i)
            states.append(ns)
            dets.append(d)
            s = ns
        return states, dets


def sname(s):
    return r"$%s_{%s}$" % (s[0], s[1:])


# --------------------------------------------------------------------------
# TikZ: state diagram (optionally with one highlighted transition)
# --------------------------------------------------------------------------
def diagram(f, cur=None, nxt=None, scale=1.0):
    L = [r"\begin{tikzpicture}[fsm,scale=%.2f,transform shape]" % scale]
    for st in f.states:
        opts = ["state"]
        if st.get("initial"):
            opts.append("initial")
        if st["id"] == cur:
            opts.append("cur")
        if st["id"] == nxt:
            opts.append("nxt")
        if st.get("meaning"):
            opts.append("label={[meaning]%s:{%s}}" % (st.get("mpos", "above"), st["meaning"]))
        txt = sname(st["id"])
        if f.kind == "moore":
            txt += r"\\[-2pt]{\scriptsize %s=%d}" % (f.out_short, f.moore_out[st["id"]])
        L.append(r"\node[%s] (%s) at (%.2f,%.2f) {%s};"
                 % (",".join(opts), st["id"], st["x"], st["y"], txt))
    for src, dst, lab, eo, no in f.edges:
        hl = cur == src and nxt == dst
        e = ",".join(x for x in (eo, "hl" if hl else "") if x)
        n = ",".join(x for x in ("elab", no, "hlnode" if hl else "") if x)
        L.append(r"\path (%s) edge[%s] node[%s] {%s} (%s);" % (src, e, n, lab, dst))
    L.append(r"\end{tikzpicture}")
    return "\n".join(L)


def fmt_in(i):
    return str(i)


def frames(f, ins, nsteps, per_row=3, scale=0.55, inname="serin", outname="det\\_out"):
    states, dets = f.run(ins)
    out = [r"\noindent"]
    w = 0.98 / per_row
    for k in range(1, nsteps + 1):
        s, ns, i, d = states[k - 1], states[k], ins[k - 1], dets[k - 1]
        when = "after edge" if f.kind == "moore" else "before edge"
        det = (r"\textcolor{red!80!black}{\textbf{%s=1}}" % outname) if d else ("%s=0" % outname)
        cap = (r"{\small\textbf{Clock %d}: \texttt{%s=%s}}\\[1pt]"
               r"{\scriptsize %s $\rightarrow$ %s \;|\; %s {\tiny(%s)}}"
               % (k, inname, fmt_in(i), sname(s), sname(ns), det, when))
        out.append(r"\begin{minipage}[t]{%.3f\textwidth}\centering" % w)
        out.append(r"\fcolorbox{black!15}{white}{\begin{minipage}{0.94\linewidth}\centering")
        out.append(diagram(f, cur=s, nxt=ns, scale=scale))
        out.append(r"\\[2pt]" + cap + r"\end{minipage}}\end{minipage}")
        out.append(r"\hfill" if k % per_row else r"\par\medskip\noindent")
    if nsteps % per_row:
        out.append(r"\par\medskip")
    return "\n".join(out)


def trace_table(f, ins, inname="serin", outname="det\\_out"):
    states, dets = f.run(ins)
    when = "after edge (Moore)" if f.kind == "moore" else "before edge (Mealy)"
    L = [r"\begin{center}\small",
         r"\begin{tabular}{c c c c c}", r"\toprule",
         r"Clock edge & \texttt{%s} sampled & Present state & Next state & \texttt{%s} {\scriptsize %s}\\"
         % (inname, outname, when), r"\midrule"]
    for k, i in enumerate(ins, 1):
        row = "%d & \\texttt{%s} & %s & %s & %s\\\\" % (
            k, fmt_in(i), sname(states[k - 1]), sname(states[k]),
            r"\textbf{1}" if dets[k - 1] else "0")
        if dets[k - 1]:
            row = r"\rowcolor{red!12}" + row
        L.append(row)
    L += [r"\bottomrule", r"\end{tabular}\end{center}"]
    return "\n".join(L)


# --------------------------------------------------------------------------
# TikZ: timing waveform
#   cycle c occupies [c, c+1); clock rises at every integer t.
#   input ins[c] is applied just after edge c and sampled at edge c+1.
# --------------------------------------------------------------------------
def segs_clk(n):
    s = []
    for c in range(n):
        s += [(c, c + 0.5, 1), (c + 0.5, c + 1, 0)]
    return s


def segs_vals(vals):
    return [(c, c + 1, v) for c, v in enumerate(vals)]


def wave_rows(f, ins, label="", inname="serin", outname="det\\_out", bus_in=False,
              extra_label=""):
    n = len(ins)
    states, _ = f.run(ins)
    st = states[:n]
    if f.kind == "moore":
        out = [f.moore_out[s] for s in st]
    else:
        out = [f.mealy_now(s, i) for s, i in zip(st, ins)]
    hot = {s for s, v in f.moore_out.items() if v} if f.kind == "moore" else set()
    rows = [
        ("state" + extra_label, "bus", segs_vals(st),
         lambda v, hot=hot: "orange!35" if v in hot else "blue!7"),
        (outname + extra_label, "bit", segs_vals(out), "red!25"),
    ]
    return rows


def wave(rows, n, unit=0.62, label_w=2.9):
    H, gap = 0.42, 0.78
    L = [r"\begin{tikzpicture}[x=%.2fcm,y=1cm,font=\scriptsize]" % unit]
    ybot = -gap * (len(rows) - 1) - 0.1
    for k in range(0, n + 1):
        L.append(r"\draw[black!18,dashed] (%d,%.2f)--(%d,%.2f);" % (k, H + 0.22, k, ybot))
        if k:
            L.append(r"\node[black!55,font=\tiny] at (%d,%.2f) {%d};" % (k, H + 0.36, k))
    L.append(r"\node[anchor=east,black!55,font=\tiny] at (-0.15,%.2f) {clock edge};" % (H + 0.36))
    for r, (label, kind, segs, col) in enumerate(rows):
        y0 = -gap * r
        L.append(r"\node[anchor=east,font=\footnotesize\ttfamily] at (-0.15,%.2f) {%s};"
                 % (y0 + H / 2, label))
        if kind == "bit":
            if col:
                for t0, t1, v in segs:
                    if v:
                        L.append(r"\fill[%s] (%.3f,%.3f) rectangle (%.3f,%.3f);"
                                 % (col, t0, y0, t1, y0 + H))
            pts = []
            for t0, t1, v in segs:
                y = y0 + H * v
                pts += [(t0, y), (t1, y)]
            L.append(r"\draw[thick,%s] " % ("blue!60!black" if label == "clk" else "black")
                     + " -- ".join("(%.3f,%.3f)" % p for p in pts) + ";")
        else:  # bus
            merged = []
            for t0, t1, v in segs:
                if merged and merged[-1][2] == v:
                    merged[-1] = (merged[-1][0], t1, v)
                else:
                    merged.append((t0, t1, v))
            d, ym = 0.1, y0 + H / 2
            for t0, t1, v in merged:
                fill = col(v) if callable(col) else "white"
                L.append(r"\draw[thick,fill=%s] (%.3f,%.3f)--(%.3f,%.3f)--(%.3f,%.3f)--(%.3f,%.3f)"
                         r"--(%.3f,%.3f)--(%.3f,%.3f)--cycle;"
                         % (fill, t0, ym, t0 + d, y0 + H, t1 - d, y0 + H, t1, ym,
                            t1 - d, y0, t0 + d, y0))
                L.append(r"\node[font=\tiny] at (%.3f,%.3f) {%s};" % ((t0 + t1) / 2, ym, v))
    L.append(r"\end{tikzpicture}")
    return "\n".join(L)


def std_wave(fsms, ins, bus_in=False, inname="serin", in_col=None):
    """Waveform for one or more FSMs driven by the same input stream."""
    n = len(ins)
    rows = [("clk", "bit", segs_clk(n), None)]
    if bus_in:
        rows.append((inname, "bus", segs_vals(ins), in_col or (lambda v: "white")))
    else:
        rows.append((inname, "bit", segs_vals(ins), None))
    for f, tag, outname in fsms:
        rows += wave_rows(f, ins, outname=outname, extra_label=tag)
    return r"\begin{center}" + wave(rows, n) + r"\end{center}"


# --------------------------------------------------------------------------
# The FSMs
# --------------------------------------------------------------------------
B2 = ["00", "01", "10", "11"]
SQ = {"S0": (0, 0), "S1": (3.4, 0), "S2": (3.4, -3.2), "S3": (0, -3.2)}
TRI = {"S0": (0, 0), "S1": (3.6, 0), "S2": (1.8, -2.9)}
TRI2 = {"S0": (0, 0), "S1": (4.6, 0), "S2": (2.3, -3.6)}


def st(id_, pos, meaning, mpos="above", initial=False):
    return dict(id=id_, x=pos[0], y=pos[1], meaning=meaning, mpos=mpos, initial=initial)


def g(t):
    return r"got \texttt{%s}" % t


# Q2: "010" non-overlapping, Moore (4 states)
q2_moore = FSM(
    "moore",
    [st("S0", SQ["S0"], r"\textit{idle}", "below left", True),
     st("S1", SQ["S1"], g("0"), "above"),
     st("S2", SQ["S2"], g("01"), "below"),
     st("S3", SQ["S3"], g("010") + " \\textbf{!}", "below")],
    [("S0", "S0", "1", "loop above", ""),
     ("S0", "S1", "0", "", ""),
     ("S1", "S1", "0", "loop right", ""),
     ("S1", "S2", "1", "", ""),
     ("S2", "S3", "0", "", ""),
     ("S2", "S0", "1", "", "pos=0.25,swap"),
     ("S3", "S1", "0", "bend right=12", "pos=0.25,swap"),
     ("S3", "S0", "1", "", "")],
    {("S0", 0): "S1", ("S0", 1): "S0", ("S1", 0): "S1", ("S1", 1): "S2",
     ("S2", 0): "S3", ("S2", 1): "S0", ("S3", 0): "S1", ("S3", 1): "S0"},
    moore_out={"S0": 0, "S1": 0, "S2": 0, "S3": 1})

# Q2 alternative: "010" non-overlapping, Mealy (3 states)
q2_mealy = FSM(
    "mealy",
    [st("S0", TRI["S0"], r"\textit{idle}", "below left", True),
     st("S1", TRI["S1"], g("0"), "above"),
     st("S2", TRI["S2"], g("01"), "below")],
    [("S0", "S0", "1/0", "loop above", ""),
     ("S0", "S1", "0/0", "", ""),
     ("S1", "S1", "0/0", "loop right", ""),
     ("S1", "S2", "1/0", "", ""),
     ("S2", "S0", r"\shortstack{\textbf{0/1}\\1/0}", "", "")],
    {("S0", 0): ("S1", 0), ("S0", 1): ("S0", 0), ("S1", 0): ("S1", 0), ("S1", 1): ("S2", 0),
     ("S2", 0): ("S0", 1), ("S2", 1): ("S0", 0)})

# Q1: 2-bit input, "01" for 3 consecutive clocks, overlap allowed (Moore)
NE01 = r"$\neq$01"
q1 = FSM(
    "moore",
    [st("S0", SQ["S0"], r"\textit{0 in a row}", "below left", True),
     st("S1", SQ["S1"], r"\textit{1 in a row}", "above"),
     st("S2", SQ["S2"], r"\textit{2 in a row}", "below"),
     st("S3", SQ["S3"], r"\textit{$\geq$3 in a row}", "left")],
    [("S0", "S0", NE01, "loop above", ""),
     ("S0", "S1", "01", "bend left=18", ""),
     ("S1", "S0", NE01, "bend left=18", ""),
     ("S1", "S2", "01", "", ""),
     ("S2", "S3", "01", "", ""),
     ("S2", "S0", NE01, "", "pos=0.3,swap"),
     ("S3", "S3", "01", "loop below", ""),
     ("S3", "S0", NE01, "", "")],
    {**{(s, v): "S0" for s in ("S0", "S1", "S2", "S3") for v in B2 if v != "01"},
     ("S0", "01"): "S1", ("S1", "01"): "S2", ("S2", "01"): "S3", ("S3", "01"): "S3"},
    moore_out={"S0": 0, "S1": 0, "S2": 0, "S3": 1})

# P3: "1011" overlapping, Mealy
p3 = FSM(
    "mealy",
    [st("S0", SQ["S0"], r"\textit{idle}", "below left", True),
     st("S1", SQ["S1"], g("1"), "above"),
     st("S2", SQ["S2"], g("10"), "below"),
     st("S3", SQ["S3"], g("101"), "below")],
    [("S0", "S0", "0/0", "loop above", ""),
     ("S0", "S1", "1/0", "", ""),
     ("S1", "S1", "1/0", "loop right", ""),
     ("S1", "S2", "0/0", "", ""),
     ("S2", "S0", "0/0", "", "pos=0.75,swap"),
     ("S2", "S3", "1/0", "bend left=18", ""),
     ("S3", "S2", "0/0", "bend left=18", ""),
     ("S3", "S1", r"\textbf{1/1}", "bend right=12", "pos=0.75,swap")],
    {("S0", 0): ("S0", 0), ("S0", 1): ("S1", 0), ("S1", 0): ("S2", 0), ("S1", 1): ("S1", 0),
     ("S2", 0): ("S0", 0), ("S2", 1): ("S3", 0), ("S3", 0): ("S2", 0), ("S3", 1): ("S1", 1)})


# P4: "101" Moore, overlapping and non-overlapping
def make_101(overlap):
    edges = [("S0", "S0", "0", "loop above", ""),
             ("S0", "S1", "1", "", ""),
             ("S1", "S1", "1", "loop right", ""),
             ("S1", "S2", "0", "", ""),
             ("S2", "S0", "0", "", "pos=0.75,swap"),
             ("S2", "S3", "1", "bend left=18" if overlap else "", ""),
             ("S3", "S1", "1", "bend right=12", "pos=0.75,swap")]
    if overlap:
        edges.append(("S3", "S2", r"\textbf{0}", "bend left=18,hlx", ""))
    else:
        edges.append(("S3", "S0", r"\textbf{0}", "hlx", ""))
    return FSM(
        "moore",
        [st("S0", SQ["S0"], r"\textit{idle}", "below left", True),
         st("S1", SQ["S1"], g("1"), "above"),
         st("S2", SQ["S2"], g("10"), "below"),
         st("S3", SQ["S3"], g("101") + " \\textbf{!}", "below")],
        edges,
        {("S0", 0): "S0", ("S0", 1): "S1", ("S1", 0): "S2", ("S1", 1): "S1",
         ("S2", 0): "S0", ("S2", 1): "S3",
         ("S3", 0): "S2" if overlap else "S0", ("S3", 1): "S1"},
        moore_out={"S0": 0, "S1": 0, "S2": 0, "S3": 1})


p4_ov, p4_nov = make_101(True), make_101(False)

# P5: 2-bit input, "11" for 2 consecutive clocks, NON-overlapping (Moore)
NE11 = r"$\neq$11"
p5 = FSM(
    "moore",
    [st("S0", TRI2["S0"], r"\textit{0 in a row}", "below left", True),
     st("S1", TRI2["S1"], r"\textit{1 in a row}", "above"),
     st("S2", TRI2["S2"], r"\textit{2 in a row}", "below")],
    [("S0", "S0", NE11, "loop above", ""),
     ("S0", "S1", "11", "bend left=18", ""),
     ("S1", "S0", NE11, "bend left=18", ""),
     ("S1", "S2", "11", "bend left=18", ""),
     ("S2", "S1", r"\textbf{11}", "bend left=18", "pos=0.3"),
     ("S2", "S0", NE11, "", "")],
    {**{(s, v): "S0" for s in ("S0", "S1", "S2") for v in B2 if v != "11"},
     ("S0", "11"): "S1", ("S1", "11"): "S2", ("S2", "11"): "S1"},
    moore_out={"S0": 0, "S1": 0, "S2": 1})

# P6: serial binary number (MSB first) divisible by 3 (Moore)
p6 = FSM(
    "moore",
    [st("R0", TRI2["S0"], r"\textit{N mod 3 = 0}", "below left", True),
     st("R1", TRI2["S1"], r"\textit{N mod 3 = 1}", "above"),
     st("R2", TRI2["S2"], r"\textit{N mod 3 = 2}", "left")],
    [("R0", "R0", "0", "loop above", ""),
     ("R0", "R1", "1", "bend left=18", ""),
     ("R1", "R0", "1", "bend left=18", ""),
     ("R1", "R2", "0", "bend left=18", ""),
     ("R2", "R1", "0", "bend left=18", ""),
     ("R2", "R2", "1", "loop below", "")],
    {("R0", 0): "R0", ("R0", 1): "R1", ("R1", 0): "R2", ("R1", 1): "R0",
     ("R2", 0): "R1", ("R2", 1): "R2"},
    moore_out={"R0": 1, "R1": 0, "R2": 0}, out_short="div3", reset="R0")


# --------------------------------------------------------------------------
# Self-check every model against a brute-force reference
# --------------------------------------------------------------------------
def ref_seq(bits, pat, overlap):
    """det[k] = 1 iff pattern ends at bit k (non-overlap: fresh bits only)."""
    out, start = [], 0
    for k in range(len(bits)):
        hit = k + 1 - start >= len(pat) and bits[k + 1 - len(pat):k + 1] == pat
        out.append(int(hit))
        if hit and not overlap:
            start = k + 1
    return out


def ref_run(vals, v, n, overlap):
    out, run = [], 0
    for x in vals:
        run = run + 1 if x == v else 0
        hit = run >= n
        out.append(int(hit))
        if hit and not overlap:
            run = 0
    return out


def selfcheck():
    rnd = random.Random(1)
    for _ in range(300):
        bits = [rnd.randint(0, 1) for _ in range(60)]
        v2 = [rnd.choice(B2 + ["01", "01", "11", "11"]) for _ in range(60)]
        assert q2_moore.run(bits)[1] == ref_seq(bits, [0, 1, 0], False)
        assert q2_mealy.run(bits)[1] == ref_seq(bits, [0, 1, 0], False)
        assert p3.run(bits)[1] == ref_seq(bits, [1, 0, 1, 1], True)
        assert p4_ov.run(bits)[1] == ref_seq(bits, [1, 0, 1], True)
        assert p4_nov.run(bits)[1] == ref_seq(bits, [1, 0, 1], False)
        assert q1.run(v2)[1] == ref_run(v2, "01", 3, True)
        assert p5.run(v2)[1] == ref_run(v2, "11", 2, False)
        val, exp = 0, []
        for b in bits:
            val = 2 * val + b
            exp.append(int(val % 3 == 0))
        assert p6.run(bits)[1] == exp
    print("self-check: all FSM models match their reference behaviour")


# --------------------------------------------------------------------------
# Verilog sources, stored as titled slices so the PDF can show them piecewise
# --------------------------------------------------------------------------
V = {}

V["seq010_moore"] = ("rtl", [
    ("Slice 1 -- ports and state encoding",
     "One state per ``how much of 010 have I seen''. Two bits are enough for four states.",
     r"""// Non-overlapping "010" sequence detector -- Moore FSM
module seq010_moore (
    input  wire clk,
    input  wire rst,       // active-high asynchronous reset
    input  wire serin,     // serial input, one bit per clock
    output reg  det_out    // high for one clock after "010" is seen
);
    localparam [1:0] S0 = 2'b00,   // idle (nothing useful yet)
                     S1 = 2'b01,   // got "0"
                     S2 = 2'b10,   // got "01"
                     S3 = 2'b11;   // got "010"  -> det_out = 1

    reg [1:0] state, next_state;
"""),
    ("Slice 2 -- state register (the only clocked block)",
     "Non-blocking \\texttt{<=}, reset to the idle state.",
     r"""
    // (1) state register
    always @(posedge clk or posedge rst) begin
        if (rst) state <= S0;
        else     state <= next_state;
    end
"""),
    ("Slice 3 -- next-state logic (combinational)",
     "Blocking \\texttt{=}, a default assignment so no latch is inferred, and one line per bubble of the diagram.",
     r"""
    // (2) next-state logic
    always @(*) begin
        next_state = S0;                          // default: no latch
        case (state)
            S0: next_state = (serin == 1'b0) ? S1 : S0;
            S1: next_state = (serin == 1'b1) ? S2 : S1;
            S2: next_state = (serin == 1'b0) ? S3 : S0;
            // NON-overlap: the "0" that completed 010 is NOT reused.
            // A new 0 starts a fresh sequence, a 1 goes back to idle.
            S3: next_state = (serin == 1'b0) ? S1 : S0;
            default: next_state = S0;
        endcase
    end
"""),
    ("Slice 4 -- output logic (Moore: state only)",
     "The output depends on the state alone, so it is glitch-free and appears one clock after the last bit.",
     r"""
    // (3) output logic
    always @(*) begin
        det_out = (state == S3);
    end
endmodule
"""),
])

V["seq010_mealy"] = ("rtl", [
    ("Mealy version -- 3 states, output on the transition",
     "Same detector with one state fewer; \\texttt{det\\_out} rises in the same clock as the final 0.",
     r"""// Non-overlapping "010" sequence detector -- Mealy FSM
module seq010_mealy (
    input  wire clk,
    input  wire rst,
    input  wire serin,
    output reg  det_out
);
    localparam [1:0] S0 = 2'd0,    // idle
                     S1 = 2'd1,    // got "0"
                     S2 = 2'd2;    // got "01"
    reg [1:0] state, next_state;

    always @(posedge clk or posedge rst)
        if (rst) state <= S0;
        else     state <= next_state;

    // next state AND output in one combinational block
    always @(*) begin
        next_state = S0;
        det_out    = 1'b0;
        case (state)
            S0: next_state = serin ? S0 : S1;
            S1: next_state = serin ? S2 : S1;
            S2: begin
                    next_state = S0;        // 011 -> idle, 010 -> idle (non-overlap)
                    det_out    = ~serin;    // "01" followed by 0: detected NOW
                end
            default: next_state = S0;
        endcase
    end
endmodule
"""),
])

V["tb_seq010"] = ("tb", [
    ("TB slice 1 -- signals, DUT and clock",
     "The testbench has no ports. Inputs are \\texttt{reg}, outputs are \\texttt{wire}.",
     r"""`timescale 1ns/1ps
module tb_seq010;
    reg  clk = 1'b0, rst = 1'b1, serin = 1'b0;
    wire det_out;
    integer i, hits = 0, errors = 0;
    reg [1:0] hist;  integer n;  reg exp;     // golden model (slice 4)

    seq010_moore dut (.clk(clk), .rst(rst), .serin(serin), .det_out(det_out));

    always #5 clk = ~clk;                     // 10 ns clock period
"""),
    ("TB slice 2 -- reset, then 100 clocks of random input",
     "Change the input 1\\,ns after the rising edge so it never races the clock.",
     r"""
    initial begin
        $dumpfile("tb_seq010.vcd");           // open in GTKWave
        $dumpvars(0, tb_seq010);
        repeat (2) @(posedge clk);            // hold reset for 2 clocks
        #1 rst = 1'b0;
        for (i = 0; i < 100; i = i + 1) begin
            serin = $random;                  // LSB of a random number: 0/1
            @(posedge clk); #1;               // held for exactly one clock
        end
        $display("DONE: %0d detections, %0d errors", hits, errors);
        $finish;
    end
"""),
    ("TB slice 3 -- print what happens on every clock",
     "\\texttt{\\$strobe} prints at the end of the time step, so it shows the new state.",
     r"""
    always @(posedge clk)
        if (!rst)
            $strobe("%6t  serin=%b  ->  state=S%0d  det_out=%b",
                    $time, serin, dut.state, det_out);
"""),
    ("TB slice 4 -- self-check against a golden model (bonus marks)",
     "Keep the last 2 bits and count fresh bits since the last hit. The non-overlap rule is that a hit needs 3 fresh bits.",
     r"""
    always @(posedge clk or posedge rst)
        if (rst) begin
            hist <= 2'b00;  n <= 0;  exp <= 1'b0;
        end else begin
            hist <= {hist[0], serin};
            if (n >= 2 && {hist, serin} == 3'b010) begin
                exp <= 1'b1;  n <= 0;                 // hit: restart counting
            end else begin
                exp <= 1'b0;  n <= (n < 2) ? n + 1 : n;
            end
        end

    always @(negedge clk)                     // compare mid-cycle
        if (!rst) begin
            if (det_out) hits = hits + 1;
            if (det_out !== exp) begin
                errors = errors + 1;
                $display("MISMATCH at %0t: det_out=%b expected=%b",
                         $time, det_out, exp);
            end
        end
endmodule
"""),
])

V["det01x3"] = ("rtl", [
    ("Slice 1 -- ports: \\texttt{serin} is now 2 bits wide",
     "Each state counts how many clocks in a row the value 01 has been seen.",
     r"""// Asserts det_out when serin == 2'b01 for 3 consecutive clocks.
// Overlap allowed: a 4th, 5th ... consecutive 01 keeps det_out high.
module det01x3 (
    input  wire       clk,
    input  wire       rst,        // active-high asynchronous reset
    input  wire [1:0] serin,      // 2-bit input every clock
    output reg        det_out
);
    localparam [1:0] S0 = 2'd0,   // 0 consecutive "01"
                     S1 = 2'd1,   // 1 consecutive "01"
                     S2 = 2'd2,   // 2 consecutive "01"
                     S3 = 2'd3;   // >= 3 consecutive  -> det_out = 1

    reg [1:0] state, next_state;
"""),
    ("Slice 2 -- state register", "Identical in every FSM you will write.",
     r"""
    always @(posedge clk or posedge rst) begin
        if (rst) state <= S0;
        else     state <= next_state;
    end
"""),
    ("Slice 3 -- next-state logic",
     "Any value other than 01 breaks the run, so the default is \\texttt{S0}. The \\texttt{S3}$\\to$\\texttt{S3} self-loop is the overlap.",
     r"""
    always @(*) begin
        next_state = S0;                  // anything except 01 -> back to S0
        if (serin == 2'b01) begin
            case (state)
                S0: next_state = S1;
                S1: next_state = S2;
                S2: next_state = S3;
                S3: next_state = S3;      // OVERLAP: stay, keep detecting
                                          // (non-overlap would be: S1)
                default: next_state = S0;
            endcase
        end
    end
"""),
    ("Slice 4 -- Moore output", "",
     r"""
    always @(*) begin
        det_out = (state == S3);
    end
endmodule
"""),
])

V["tb_det01x3"] = ("tb", [
    ("TB slice 1 -- signals, DUT, clock", "",
     r"""`timescale 1ns/1ps
module tb_det01x3;
    reg        clk = 1'b0, rst = 1'b1;
    reg  [1:0] serin = 2'b00;
    wire       det_out;
    integer    i, hits = 0, errors = 0, run;
    reg        exp;

    det01x3 dut (.clk(clk), .rst(rst), .serin(serin), .det_out(det_out));

    always #5 clk = ~clk;
"""),
    ("TB slice 2 -- 100 random clocks",
     "Pure random hits 01 only 1 time in 4, so three in a row is rare. The commented line biases the input so you see detections.",
     r"""
    initial begin
        $dumpfile("tb_det01x3.vcd");
        $dumpvars(0, tb_det01x3);
        repeat (2) @(posedge clk);
        #1 rst = 1'b0;
        for (i = 0; i < 100; i = i + 1) begin
            serin = $random;                              // 00/01/10/11
            // serin = ({$random} % 3 != 0) ? 2'b01 : $random;  // more hits
            @(posedge clk); #1;
        end
        $display("DONE: %0d clocks with det_out=1, %0d errors", hits, errors);
        $finish;
    end

    always @(posedge clk)
        if (!rst)
            $strobe("%6t  serin=%b  ->  state=S%0d  det_out=%b",
                    $time, serin, dut.state, det_out);
"""),
    ("TB slice 3 -- golden model: a run-length counter", "",
     r"""
    always @(posedge clk or posedge rst)
        if (rst)                  begin run <= 0; exp <= 1'b0; end
        else if (serin == 2'b01)  begin run <= (run < 3) ? run + 1 : run;
                                        exp <= (run >= 2);              end
        else                      begin run <= 0; exp <= 1'b0; end

    always @(negedge clk)
        if (!rst) begin
            if (det_out) hits = hits + 1;
            if (det_out !== exp) begin
                errors = errors + 1;
                $display("MISMATCH at %0t", $time);
            end
        end
endmodule
"""),
])

V["seq1011_mealy"] = ("rtl", [
    ("RTL -- \\texttt{1011} overlapping, Mealy",
     "In \\texttt{S3} the 1 that completes the pattern is also the start of the next one, so go to \\texttt{S1}, not \\texttt{S0}.",
     r"""// Overlapping "1011" detector -- Mealy FSM
module seq1011_mealy (
    input  wire clk,
    input  wire rst,
    input  wire serin,
    output reg  det_out
);
    localparam [1:0] S0 = 2'd0,   // idle
                     S1 = 2'd1,   // got "1"
                     S2 = 2'd2,   // got "10"
                     S3 = 2'd3;   // got "101"
    reg [1:0] state, next_state;

    always @(posedge clk or posedge rst)
        if (rst) state <= S0;
        else     state <= next_state;

    always @(*) begin
        next_state = S0;
        det_out    = 1'b0;
        case (state)
            S0: next_state = serin ? S1 : S0;
            S1: next_state = serin ? S1 : S2;   // "11" -> still "1"
            S2: next_state = serin ? S3 : S0;   // "100" -> nothing
            S3: if (serin) begin                // "1011" found!
                    next_state = S1;            // overlap: keep last "1"
                    det_out    = 1'b1;
                end else
                    next_state = S2;            // "1010" -> keep "10"
            default: next_state = S0;
        endcase
    end
endmodule
"""),
])

V["tb_seq1011"] = ("tb", [
    ("TB -- Mealy output is checked just before the clock edge",
     "For a Mealy FSM, sample \\texttt{det\\_out} at the rising edge with \\texttt{\\$display} (old state, current input). Do not use \\texttt{\\$strobe} here.",
     r"""`timescale 1ns/1ps
module tb_seq1011;
    reg  clk = 1'b0, rst = 1'b1, serin = 1'b0;
    wire det_out;
    integer i, hits = 0;

    seq1011_mealy dut (.clk(clk), .rst(rst), .serin(serin), .det_out(det_out));

    always #5 clk = ~clk;

    initial begin
        $dumpfile("tb_seq1011.vcd");
        $dumpvars(0, tb_seq1011);
        repeat (2) @(posedge clk);
        #1 rst = 1'b0;
        for (i = 0; i < 100; i = i + 1) begin
            serin = $random;
            @(posedge clk); #1;
        end
        $display("DONE: %0d detections of 1011", hits);
        $finish;
    end

    always @(posedge clk)                    // values just BEFORE the edge
        if (!rst) begin
            $display("%6t  state=S%0d  serin=%b  det_out=%b",
                     $time, dut.state, serin, det_out);
            if (det_out) hits = hits + 1;
        end
endmodule
"""),
])

V["seq101_moore"] = ("rtl", [
    ("RTL -- one parameter switches overlap on and off",
     "Only the 0-branch out of \\texttt{S3} differs between the two versions.",
     r"""// "101" detector -- Moore FSM, OVERLAP = 1 (overlapping) or 0 (non-overlapping)
module seq101_moore #(parameter OVERLAP = 1) (
    input  wire clk,
    input  wire rst,
    input  wire serin,
    output reg  det_out
);
    localparam [1:0] S0 = 2'd0, S1 = 2'd1, S2 = 2'd2, S3 = 2'd3;
    reg [1:0] state, next_state;

    always @(posedge clk or posedge rst)
        if (rst) state <= S0;
        else     state <= next_state;

    always @(*) begin
        next_state = S0;
        case (state)
            S0: next_state = serin ? S1 : S0;
            S1: next_state = serin ? S1 : S2;
            S2: next_state = serin ? S3 : S0;
            S3: next_state = serin ? S1 : (OVERLAP ? S2 : S0);   // <-- the difference
            default: next_state = S0;
        endcase
    end

    always @(*) det_out = (state == S3);
endmodule
"""),
])

V["tb_seq101"] = ("tb", [
    ("TB -- both versions side by side on the same random input", "",
     r"""`timescale 1ns/1ps
module tb_seq101;
    reg  clk = 1'b0, rst = 1'b1, serin = 1'b0;
    wire det_ov, det_nov;
    integer i;

    seq101_moore #(.OVERLAP(1)) u_ov  (.clk(clk), .rst(rst), .serin(serin), .det_out(det_ov));
    seq101_moore #(.OVERLAP(0)) u_nov (.clk(clk), .rst(rst), .serin(serin), .det_out(det_nov));

    always #5 clk = ~clk;

    initial begin
        $dumpfile("tb_seq101.vcd");
        $dumpvars(0, tb_seq101);
        repeat (2) @(posedge clk);
        #1 rst = 1'b0;
        for (i = 0; i < 100; i = i + 1) begin
            serin = $random;
            @(posedge clk); #1;
        end
        $finish;
    end

    always @(posedge clk)
        if (!rst)
            $strobe("%6t serin=%b | overlap: S%0d det=%b | non-overlap: S%0d det=%b",
                    $time, serin, u_ov.state, det_ov, u_nov.state, det_nov);
endmodule
"""),
])

V["det11x2"] = ("rtl", [
    ("RTL -- 2-bit input, \\texttt{11} on 2 consecutive clocks, non-overlapping",
     "This is the same counter-chain idea as Q1 with fewer states. Non-overlap means that after a hit, a new 11 counts as the first one again.",
     r"""// det_out = 1 when serin == 2'b11 on 2 consecutive clocks, NON-overlapping
module det11x2 (
    input  wire       clk,
    input  wire       rst,
    input  wire [1:0] serin,
    output reg        det_out
);
    localparam [1:0] S0 = 2'd0,   // 0 in a row
                     S1 = 2'd1,   // 1 in a row
                     S2 = 2'd2;   // 2 in a row -> det_out = 1
    reg [1:0] state, next_state;

    always @(posedge clk or posedge rst)
        if (rst) state <= S0;
        else     state <= next_state;

    always @(*) begin
        next_state = S0;
        if (serin == 2'b11)
            case (state)
                S0:      next_state = S1;
                S1:      next_state = S2;
                S2:      next_state = S1;   // non-overlap: count restarts at 1
                default: next_state = S0;   // (overlap would be: S2)
            endcase
    end

    always @(*) det_out = (state == S2);
endmodule
"""),
])

V["div3_fsm"] = ("rtl", [
    ("RTL -- remainder FSM (binary number arrives MSB first)",
     "Shifting in bit $b$ turns $N$ into $2N+b$, so the next remainder is $(2r+b) \\bmod 3$. Three states, one per remainder.",
     r"""// div3 = 1 when the binary number received so far (MSB first) is divisible by 3
module div3_fsm (
    input  wire clk,
    input  wire rst,
    input  wire bin,       // serial bit, MSB first
    output reg  div3
);
    localparam [1:0] R0 = 2'd0, R1 = 2'd1, R2 = 2'd2;   // remainder 0/1/2
    reg [1:0] state, next_state;

    always @(posedge clk or posedge rst)
        if (rst) state <= R0;
        else     state <= next_state;

    always @(*) begin
        case (state)                     // next = (2*r + bin) mod 3
            R0:      next_state = bin ? R1 : R0;
            R1:      next_state = bin ? R0 : R2;
            R2:      next_state = bin ? R2 : R1;
            default: next_state = R0;
        endcase
    end

    always @(*) div3 = (state == R0);
endmodule
"""),
])


# every RTL file starts with the same timescale as the testbenches
for _n, (_k, _sl) in V.items():
    if _k == "rtl":
        _t, _e, _src = _sl[0]
        _sl[0] = (_t, _e, "`timescale 1ns/1ps\n" + _src.lstrip("\n"))


def write_verilog():
    for name, (kind, slices) in V.items():
        d = RTL if kind == "rtl" else TB
        with open(os.path.join(d, name + ".v"), "w") as fh:
            fh.write("".join(code for _, _, code in slices).lstrip("\n"))


def code(name, idx=None):
    """LaTeX for the slices of one source file (all slices if idx is None)."""
    kind, slices = V[name]
    pick = slices if idx is None else [slices[j] for j in idx]
    out = []
    for title, expl, src in pick:
        out.append(r"\begin{codeslice}{%s}{%s.v}" % (title, name.replace("_", r"\_")))
        if expl:
            out.append(r"\slicenote{%s}" % expl)
        out.append(r"\begin{lstlisting}")
        out.append(src.strip("\n"))
        out.append(r"\end{lstlisting}")
        out.append(r"\end{codeslice}")
    return "\n".join(out)


# --------------------------------------------------------------------------
# Example input streams used for frames / tables / waveforms
# --------------------------------------------------------------------------
IN_Q2 = [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1]
IN_Q1 = ["01", "01", "01", "01", "10", "01", "01", "00", "01", "01", "01", "11",
         "01", "01", "01", "01", "01", "10", "00", "01"]
IN_P3 = [1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0]
IN_P4 = [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0]
IN_P5 = ["11", "11", "11", "11", "11", "10", "11", "11", "00", "11", "01", "11",
         "11", "11", "11", "11", "00", "11", "10", "01"]
IN_P6 = [1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0]


def bus01(v):
    return "green!25" if v == "01" else "white"


def bus11(v):
    return "green!25" if v == "11" else "white"


def p6_wave():
    n = len(IN_P6)
    vals, x = [], 0
    for b in IN_P6:
        x = 2 * x + b
        vals.append(x)
    states, _ = p6.run(IN_P6)
    rows = [("clk", "bit", segs_clk(n), None),
            ("bin", "bit", segs_vals(IN_P6), None),
            ("N so far", "bus", [(c + 1, c + 2 if c + 2 <= n else n, vals[c])
                                for c in range(n - 1)], lambda v: "white"),
            ("state", "bus", segs_vals(states[:n]),
             lambda v: "orange!35" if v == "R0" else "blue!7"),
            ("div3", "bit", segs_vals([p6.moore_out[s] for s in states[:n]]), "red!25")]
    return r"\begin{center}" + wave(rows, n) + r"\end{center}"


# --------------------------------------------------------------------------
# LaTeX document
# --------------------------------------------------------------------------
PREAMBLE = r"""\documentclass[10pt,a4paper]{article}
\usepackage[margin=1.7cm]{geometry}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[table]{xcolor}
\usepackage{tikz}
\usetikzlibrary{automata,positioning,arrows.meta,calc}
\usepackage{listings}
\usepackage{booktabs,array,enumitem,multicol}
\usepackage[most]{tcolorbox}
\usepackage{fancyhdr}
\usepackage[colorlinks=true,linkcolor=blue!50!black,urlcolor=blue!50!black]{hyperref}
\setlength{\parindent}{0pt}
\setlength{\parskip}{4pt}

\pagestyle{fancy}\fancyhf{}
\lhead{\small FSM design in Verilog -- exam notes}
\rhead{\small\thepage}

\definecolor{kw}{RGB}{0,70,160}
\definecolor{cm}{RGB}{0,120,60}
\definecolor{st}{RGB}{170,40,40}
\lstdefinelanguage{V}[]{Verilog}{morekeywords={localparam,logic,integer,always,initial,
  posedge,negedge,begin,end,case,endcase,default,module,endmodule,parameter,if,else,
  repeat,for},
  morekeywords=[2]{$display,$strobe,$monitor,$random,$finish,$dumpfile,$dumpvars,$time}}
\lstset{language=V,basicstyle=\ttfamily\small,keywordstyle=\color{kw}\bfseries,
  keywordstyle=[2]\color{st},commentstyle=\color{cm}\itshape,stringstyle=\color{st},
  columns=fullflexible,keepspaces=true,showstringspaces=false,
  numbers=left,numberstyle=\tiny\color{black!40},numbersep=6pt,xleftmargin=14pt,
  aboveskip=2pt,belowskip=0pt,tabsize=4}

\newtcolorbox{codeslice}[2]{enhanced,breakable,colback=black!2,colframe=black!55,
  boxrule=0.5pt,arc=2pt,left=2pt,right=4pt,top=2pt,bottom=2pt,
  fonttitle=\small\bfseries,title={#1},after title={\hfill\ttfamily\mdseries #2}}
\newcommand{\slicenote}[1]{{\small\color{black!70}\itshape #1}\par\smallskip}
\newtcolorbox{tip}[1][Exam tip]{colback=yellow!8,colframe=orange!70!black,boxrule=0.6pt,
  arc=2pt,fonttitle=\small\bfseries,title={#1},left=4pt,right=4pt,top=2pt,bottom=2pt}
\newtcolorbox{qbox}[1]{colback=blue!4,colframe=blue!50!black,boxrule=0.6pt,arc=2pt,
  fonttitle=\bfseries,title={#1},left=4pt,right=4pt}

\tikzset{
  fsm/.style={->,>={Stealth[length=2.4mm]},auto,semithick,node distance=3cm,
    every state/.style={draw=black!75,fill=blue!6,minimum size=12.5mm,inner sep=1pt,
      align=center,font=\small},
    initial text={\scriptsize rst}, every loop/.style={looseness=7}},
  cur/.style={fill=yellow!75},
  nxt/.style={draw=red!80!black,line width=1.8pt},
  hl/.style={draw=red!80!black,line width=1.8pt},
  hlx/.style={draw=blue!70!black,line width=1.1pt},
  hlnode/.style={text=red!80!black,font=\small\bfseries},
  elab/.style={font=\small},
  meaning/.style={font=\scriptsize\itshape,text=black!60,inner sep=1pt},
}
"""


def legend():
    return (r"{\small Legend for the step-by-step pictures: "
            r"\tikz\node[draw=black!75,fill=yellow!75,circle,minimum size=3mm,inner sep=0]{};"
            r"~present state \quad "
            r"\tikz\node[draw=red!80!black,line width=1.6pt,fill=blue!6,circle,minimum size=3mm,inner sep=0]{};"
            r"~next state \quad "
            r"\tikz\draw[->,>=Stealth,red!80!black,line width=1.6pt](0,0)--(0.6,0);"
            r"~transition taken on this clock edge}\par\smallskip")


def build_tex():
    T = [PREAMBLE, r"\begin{document}"]

    # ---------------- title + how to use ----------------
    T.append(r"""
\begin{center}
{\LARGE\bfseries Finite State Machines in Verilog}\\[3pt]
{\large Sequence detectors: design, always blocks, testbench, diagrams and waveforms}
\end{center}
\vspace{-2pt}
\begin{tcolorbox}[colback=black!3,colframe=black!40,boxrule=0.4pt,arc=2pt]
\small
\textbf{What is inside.} The two questions you were given (\textbf{Q1}, \textbf{Q2}),
four predicted questions (\textbf{P3}--\textbf{P6}) and a page of quick variations.
Each question comes with the state meanings, a state diagram, a step-by-step picture of every
transition, a trace table, the waveform, the RTL in short labelled slices, and a testbench
that applies random input for 100 clocks.

\textbf{Conventions used throughout.} Active-high \emph{asynchronous} reset to $S_0$.
The testbench changes the input 1\,ns after each rising edge, so each input value
is held for one full clock and \emph{sampled at the next rising edge}. In the waveforms
the numbers on top are the rising edges, and edge $k$ samples the input drawn just before it.
\end{tcolorbox}

\tableofcontents
""")

    # ---------------- method ----------------
    T.append(r"""
\section{The 5-step recipe that solves every detector question}
\begin{enumerate}[leftmargin=*,itemsep=2pt]
\item \textbf{Name the states by ``what I have seen so far''.} For a pattern $p$ of length $n$, the states are
  the prefixes of $p$: $S_0=$ nothing, $S_1=$ first bit, \dots. A \textbf{Mealy} machine needs $n$ states.
  A \textbf{Moore} machine needs $n+1$, because the extra state ``whole pattern seen'' drives the output.
  For ``value $V$ on a multi-bit input for $N$ consecutive clocks'', the states simply count the run
  ($0,1,\dots,N$ in a row).
\item \textbf{The correct-bit arrow.} From each state, the bit that extends the prefix moves one state forward.
\item \textbf{The wrong-bit arrow.} Take (what you had $+$ the wrong bit) and find its \emph{longest ending
  that is still a start of the pattern}. Go to the state for that ending, or to $S_0$ if there is none.
\item \textbf{After a detection: overlap or not?}
  \begin{itemize}[itemsep=0pt]
  \item \emph{Overlapping}: treat the detected pattern like any other prefix, using the step-3 rule
        (``1011'' $\to$ keep the trailing ``1'').
  \item \emph{Non-overlapping}: the detected bits are used up, so restart as if from $S_0$ with
        the new bit.
  \end{itemize}
\item \textbf{Write three always blocks}: state register (\texttt{<=}),
  next-state logic (\texttt{always @(*)}, \texttt{=}, default first),
  output logic (Moore: from the state only; Mealy: from the state \emph{and} the input).
\end{enumerate}

\begin{center}\small
\begin{tabular}{>{\bfseries}p{3.2cm} p{6.2cm} p{6.2cm}}
\toprule
 & Moore & Mealy \\ \midrule
Output depends on & present state only & present state \emph{and} present input \\
States for $n$-bit pattern & $n+1$ & $n$ \\
When \texttt{det\_out} rises & one clock \emph{after} the last bit is sampled & in the \emph{same} clock as the last bit (before the edge) \\
Glitches & none (output is a function of flip-flops) & can follow input glitches \\
Where output is written & in the bubble: \texttt{S3/1} & on the arrow: \texttt{in/out} \\
\bottomrule
\end{tabular}
\end{center}

\begin{tip}[Marks are usually lost on]
\begin{itemize}[leftmargin=*,itemsep=0pt]
\item a missing \texttt{default} or missing default assignment in \texttt{always @(*)} (this infers a latch, so the design is not synthesizable as intended);
\item using \texttt{<=} in combinational logic or \texttt{=} in the clocked block;
\item driving the testbench input exactly on \texttt{posedge clk} (a race). Use \texttt{@(posedge clk); \#1;} or \texttt{@(negedge clk)};
\item forgetting the self-loops: every state needs an arrow for \emph{every} input value;
\item non-overlap vs.\ overlap: only the arrows \emph{leaving the final state} change.
\end{itemize}
\end{tip}

\subsection*{Generic template (memorise this skeleton)}
\begin{codeslice}{Three-block FSM template}{template}
\begin{lstlisting}
module my_fsm (input wire clk, rst, input wire serin, output reg det_out);
    localparam [1:0] S0 = 2'd0, S1 = 2'd1, S2 = 2'd2, S3 = 2'd3;
    reg [1:0] state, next_state;

    always @(posedge clk or posedge rst)          // 1. state register
        if (rst) state <= S0; else state <= next_state;

    always @(*) begin                             // 2. next-state logic
        next_state = S0;                          //    default first!
        case (state)
            S0: next_state = serin ? S0 : S1;     //    one line per bubble
            // ...
            default: next_state = S0;
        endcase
    end

    always @(*) det_out = (state == S3);          // 3. output (Moore)
endmodule
\end{lstlisting}
\end{codeslice}
""")

    # ---------------- Q2 ----------------
    T.append(r"""
\newpage
\section{Q2 (given) -- non-overlapping ``010'' detector, 1-bit \texttt{serin}}
\begin{qbox}{Question}
Model a non-overlapping sequence detector FSM that detects a sequence ``010'' in a single-bit serial input
\texttt{serin}. The FSM asserts an output \texttt{det\_out} on detecting a correct sequence. Verify the FSM
with random inputs applied for an interval of 100 clocks.
\end{qbox}

\subsection{Building the state table step by step}
\begin{center}\small
\begin{tabular}{c l c c l}
\toprule
State & Meaning & \texttt{serin}=0 & \texttt{serin}=1 & Why \\ \midrule
$S_0$ & idle & $S_1$ & $S_0$ & 0 starts the pattern; ``1'' is useless \\
$S_1$ & got \texttt{0} & $S_1$ & $S_2$ & ``00'' still ends in ``0'' $\Rightarrow$ stay \\
$S_2$ & got \texttt{01} & $S_3$ & $S_0$ & ``011'' has no ending that starts ``010'' \\
\rowcolor{orange!15} $S_3$ & got \texttt{010}, \textbf{det\_out=1} & $S_1$ & $S_0$ & \textbf{non-overlap}: start again from scratch \\
\bottomrule
\end{tabular}
\end{center}
{\small If the question said \emph{overlapping}, only one arrow changes: $S_3 \xrightarrow{1} S_2$
(the last ``0'' of ``010'' is reused as the first ``0'' of ``01'').}

\subsection{State diagram (Moore, 4 states)}
\begin{center}
""" + diagram(q2_moore) + r"""
\end{center}

\subsection{Step-by-step: watch the machine run on \texttt{""" + "".join(map(str, IN_Q2[:12])) + r"""}}
""" + legend() + frames(q2_moore, IN_Q2, 12) + r"""

\begin{tip}[Notice the non-overlap at clocks 2--6]
The input \texttt{01010} (clocks 2--6) contains ``010'' at clocks 2--4 \emph{and} ``010'' at clocks 4--6,
sharing the 0 of clock 4. Non-overlapping counts only the first one. At clock 5 the 1 sends
$S_3\to S_0$, so the shared 0 is not reused, and the next detection needs a brand-new ``010''.
\end{tip}

\subsection{Trace table}
""" + trace_table(q2_moore, IN_Q2) + r"""

\subsection{Waveform (Moore and Mealy versions on the same input)}
""" + std_wave([(q2_moore, " (Moore)", "det\\_out"), (q2_mealy, " (Mealy)", "det\\_out")], IN_Q2) + r"""
{\small Moore raises \texttt{det\_out} for the clock \emph{after} the edge that sampled the final 0.
Mealy raises it while that final 0 is still on the input, one clock earlier and with one state fewer.}

\subsection{RTL -- Moore version, slice by slice}
""" + code("seq010_moore") + r"""

\subsection{Mealy alternative (if asked, or to show you know both)}
\begin{center}
""" + diagram(q2_mealy, scale=0.9) + r"""
\end{center}
""" + code("seq010_mealy") + r"""

\subsection{Testbench -- 100 random clocks, slice by slice}
""" + code("tb_seq010") + r"""
""")

    # ---------------- Q1 ----------------
    T.append(r"""
\newpage
\section{Q1 (given) -- ``01'' on a 2-bit \texttt{serin} for 3 consecutive clocks, overlap allowed}
\begin{qbox}{Question}
Write a synthesizable behavioral model of an FSM that asserts an output \texttt{det\_out} if the value ``01''
is received in a 2-bit input \texttt{serin} for three consecutive clocks with overlaps allowed. Write a test
bench for verifying the FSM with random inputs applied for 100 clocks.
\end{qbox}

\subsection{Key idea: this is a counter, not a bit pattern}
Here \texttt{serin} is a 2-bit \emph{bus}, and ``01'' is one value of it (\texttt{2'b01}). The FSM only has to
count how many clocks \emph{in a row} it has seen \texttt{01}. Any other value (00, 10, 11) breaks the run.
\emph{Overlap allowed} means a 4th consecutive 01 is a new run of three (clocks 2--4), so \texttt{det\_out}
stays high, which is the self-loop on $S_3$.

\begin{center}\small
\begin{tabular}{c l c c}
\toprule
State & Meaning & \texttt{serin}=01 & \texttt{serin}$\neq$01 \\ \midrule
$S_0$ & 0 in a row & $S_1$ & $S_0$ \\
$S_1$ & 1 in a row & $S_2$ & $S_0$ \\
$S_2$ & 2 in a row & $S_3$ & $S_0$ \\
\rowcolor{orange!15} $S_3$ & $\geq$3 in a row, \textbf{det\_out=1} & $S_3$ (overlap) & $S_0$ \\
\bottomrule
\end{tabular}
\end{center}
{\small Non-overlapping variant: $S_3 \xrightarrow{01} S_1$ (the run restarts at 1).}

\subsection{State diagram (Moore)}
\begin{center}
""" + diagram(q1) + r"""
\end{center}

\subsection{Step-by-step}
""" + legend() + frames(q1, IN_Q1, 9) + r"""

\subsection{Trace table}
""" + trace_table(q1, IN_Q1) + r"""

\subsection{Waveform}
""" + std_wave([(q1, "", "det\\_out")], IN_Q1, bus_in=True, in_col=bus01) + r"""
{\small Green = \texttt{01}. \texttt{det\_out} goes high one clock after the 3rd consecutive 01 is
sampled and \emph{stays} high while the run continues (overlap). A single non-01 value drops it.}

\subsection{RTL, slice by slice}
""" + code("det01x3") + r"""

\subsection{Testbench, slice by slice}
""" + code("tb_det01x3") + r"""
""")

    # ---------------- P3 ----------------
    T.append(r"""
\newpage
\section{Predicted P3 -- overlapping ``1011'' detector (Mealy)}
\begin{qbox}{Likely wording}
Design a Mealy FSM that detects the overlapping sequence ``1011'' on a serial input and asserts
\texttt{det\_out}. Draw the state diagram and write the testbench for 100 random clocks.
\end{qbox}
\begin{center}\small
\begin{tabular}{c l c c l}
\toprule
State & Seen & in=0 & in=1 & Reasoning for the ``wrong'' bit \\ \midrule
$S_0$ & -- & $S_0$/0 & $S_1$/0 & \\
$S_1$ & \texttt{1} & $S_2$/0 & $S_1$/0 & ``11'' ends in ``1'' \\
$S_2$ & \texttt{10} & $S_0$/0 & $S_3$/0 & ``100'' has no useful ending \\
$S_3$ & \texttt{101} & $S_2$/0 & \cellcolor{orange!20}$S_1$/\textbf{1} & ``1010'' ends in ``10''; ``1011'' ends in ``1'' (overlap) \\
\bottomrule
\end{tabular}
\end{center}
\begin{center}
""" + diagram(p3) + r"""
\end{center}
\subsection{Step-by-step}
""" + legend() + frames(p3, IN_P3, 9) + r"""
\subsection{Trace table and waveform}
""" + trace_table(p3, IN_P3[:14]) + std_wave([(p3, "", "det\\_out")], IN_P3) + r"""
{\small Mealy: \texttt{det\_out} is high \emph{during} the clock in which the final 1 is on the input,
so it is captured by the same edge that samples that bit. Clocks 4 and 7 show the overlap:
``1011011'' gives two hits.}

""" + code("seq1011_mealy") + code("tb_seq1011") + r"""
""")

    # ---------------- P4 ----------------
    T.append(r"""
\newpage
\section{Predicted P4 -- ``101'': overlapping vs.\ non-overlapping (Moore)}
\begin{qbox}{Likely wording}
Design a Moore FSM to detect ``101''. (a) overlapping, (b) non-overlapping. Compare the outputs for the same
input stream.
\end{qbox}
\begin{center}
\begin{minipage}{0.48\textwidth}\centering\textbf{(a) Overlapping}\\[2pt]
""" + diagram(p4_ov, scale=0.8) + r"""
\end{minipage}\hfill
\begin{minipage}{0.48\textwidth}\centering\textbf{(b) Non-overlapping}\\[2pt]
""" + diagram(p4_nov, scale=0.8) + r"""
\end{minipage}
\end{center}
{\small The \textcolor{blue!70!black}{blue} arrow is the only difference. With overlap, in $S_3$ (``101'') a 0 gives ``1010'', whose
ending ``10'' is reused, so go to $S_2$. Without overlap, the bits are used up, so go to $S_0$.}

\subsection{Waveform: same input, both machines}
""" + std_wave([(p4_ov, " ovl", "det"), (p4_nov, " non", "det")], IN_P4) + r"""
{\small Input \texttt{10101} gives \textbf{two} hits with overlap (clocks 3 and 5) but only \textbf{one}
without. That is exactly what the examiner wants you to show.}

""" + code("seq101_moore") + code("tb_seq101") + r"""
""")

    # ---------------- P5 ----------------
    T.append(r"""
\newpage
\section{Predicted P5 -- ``11'' twice in a row on a 2-bit input (non-overlapping)}
\begin{qbox}{Likely wording (a Q1 twin)}
Assert \texttt{det\_out} when ``11'' is received on a 2-bit input for two consecutive clocks,
\emph{non-overlapping}. Verify with 100 random clocks.
\end{qbox}
\begin{center}
""" + diagram(p5, scale=0.9) + r"""
\end{center}
{\small After a detection ($S_2$) another 11 is the \emph{first} of a new pair, so go to $S_1$, not $S_2$.
So ``11 11 11 11'' gives hits after the 2nd and 4th values only.}
""" + std_wave([(p5, "", "det\\_out")], IN_P5, bus_in=True, in_col=bus11) + code("det11x2") + r"""
{\small Testbench: copy \texttt{tb\_det01x3.v}, change the module name and compare against
\texttt{2'b11}. The repository has the RTL ready.}
""")

    # ---------------- P6 ----------------
    T.append(r"""
\section{Predicted P6 -- serial number divisible by 3}
\begin{qbox}{Likely wording}
A binary number arrives serially, MSB first. Assert \texttt{div3} whenever the number received so far is
divisible by 3.
\end{qbox}
\begin{minipage}{0.45\textwidth}\centering
""" + diagram(p6, scale=0.85) + r"""
\end{minipage}\hfill
\begin{minipage}{0.5\textwidth}\small
\begin{tabular}{c c c}
\toprule
$r$ & bin=0 ($2r$) & bin=1 ($2r+1$) \\ \midrule
0 & 0 & 1 \\ 1 & 2 & 0 \\ 2 & 1 & 2 \\ \bottomrule
\end{tabular}\\[4pt]
The state stores the remainder, not the number, so three states are enough
for any length. Generalise: divisible by $m$ needs $m$ states, next $=(2r+b)\bmod m$.
\end{minipage}
""" + p6_wave() + code("div3_fsm") + r"""
""")

    # ---------------- variations ----------------
    T.append(r"""
\section{Quick variations -- state tables you can draw in 2 minutes}
\begin{multicols}{2}\small
\textbf{``110'' non-overlapping, Mealy}\\
\begin{tabular}{c c c}\toprule
 & in=0 & in=1\\\midrule
$S_0$ & $S_0$/0 & $S_1$/0\\
$S_1$ (\texttt{1}) & $S_0$/0 & $S_2$/0\\
$S_2$ (\texttt{11}) & \cellcolor{orange!20}$S_0$/\textbf{1} & $S_2$/0\\\bottomrule
\end{tabular}\\[2pt]
{\footnotesize ``111'' still ends in ``11'' so stay in $S_2$.}

\medskip
\textbf{``1001'' overlapping, Mealy}\\
\begin{tabular}{c c c}\toprule
 & in=0 & in=1\\\midrule
$S_0$ & $S_0$/0 & $S_1$/0\\
$S_1$ (\texttt{1}) & $S_2$/0 & $S_1$/0\\
$S_2$ (\texttt{10}) & $S_3$/0 & $S_1$/0\\
$S_3$ (\texttt{100}) & $S_0$/0 & \cellcolor{orange!20}$S_1$/\textbf{1}\\\bottomrule
\end{tabular}\\[2pt]
{\footnotesize After ``1001'' the last 1 is reused, so go to $S_1$.}

\medskip
\textbf{Three consecutive 1s (``111''), overlapping, Moore}\\
\begin{tabular}{c c c c}\toprule
 & in=0 & in=1 & out\\\midrule
$S_0$ & $S_0$ & $S_1$ & 0\\
$S_1$ & $S_0$ & $S_2$ & 0\\
$S_2$ & $S_0$ & $S_3$ & 0\\
$S_3$ & $S_0$ & $S_3$ & \textbf{1}\\\bottomrule
\end{tabular}

\columnbreak
\textbf{``0110'' overlapping, Moore}\\
\begin{tabular}{c c c c}\toprule
 & in=0 & in=1 & out\\\midrule
$S_0$ & $S_1$ & $S_0$ & 0\\
$S_1$ (\texttt{0}) & $S_1$ & $S_2$ & 0\\
$S_2$ (\texttt{01}) & $S_1$ & $S_3$ & 0\\
$S_3$ (\texttt{011}) & $S_4$ & $S_0$ & 0\\
$S_4$ (\texttt{0110}) & $S_1$ & $S_2$ & \textbf{1}\\\bottomrule
\end{tabular}\\[2pt]
{\footnotesize From $S_4$: ``01100'' ends in ``0'', and ``01101'' ends in ``01''.}

\medskip
\textbf{Even number of 1s (parity), Moore}\\
\begin{tabular}{c c c c}\toprule
 & in=0 & in=1 & out\\\midrule
EVEN & EVEN & ODD & 1\\
ODD & ODD & EVEN & 0\\\bottomrule
\end{tabular}

\medskip
\textbf{Converting Moore $\to$ Mealy}: move each state's output onto every arrow
\emph{entering} it, then merge states that now behave identically (``010'': 4 $\to$ 3 states).\\[2pt]
\textbf{Mealy $\to$ Moore}: split any state that is entered with different outputs.
\end{multicols}

\begin{tip}[Likely short (theory) questions]
\begin{enumerate}[leftmargin=*,itemsep=0pt]
\item Differentiate Moore and Mealy FSMs. Which one needs more states, and which responds faster?
\item What is the difference between overlapping and non-overlapping detection? Show it with a waveform.
\item Why are FSMs coded with separate sequential and combinational always blocks?
\item What causes an unintended latch in an FSM, and how do you avoid it?
\item Binary vs.\ one-hot vs.\ Gray state encoding: how many flip-flops does each need for $N$ states?
  (binary $\lceil\log_2 N\rceil$, one-hot $N$, Gray $\lceil\log_2 N\rceil$.)
\item Why does the testbench change inputs on the negative edge or after a small delay, and not at
  \texttt{posedge}?
\item Synchronous vs.\ asynchronous reset: write both forms of the state register.
\end{enumerate}
\end{tip}

\begin{codeslice}{Synchronous vs.\ asynchronous reset}{snippet}
\begin{lstlisting}
always @(posedge clk or posedge rst)   // ASYNC: reset acts immediately
    if (rst) state <= S0; else state <= next_state;

always @(posedge clk)                  // SYNC: reset only at a clock edge
    if (rst) state <= S0; else state <= next_state;
\end{lstlisting}
\end{codeslice}

\section*{Running the code}
{\small
\texttt{iverilog -o sim rtl/seq010\_moore.v tb/tb\_seq010.v \&\& vvp sim \&\& gtkwave tb\_seq010.vcd}\\
The same works for every \texttt{rtl/*.v} + \texttt{tb/tb\_*.v} pair. Signals to add in GTKWave:
\texttt{clk, rst, serin, dut.state, det\_out}.}

\end{document}
""")
    return "\n".join(T)


if __name__ == "__main__":
    selfcheck()
    write_verilog()
    with open(os.path.join(DOC, "fsm_notes.tex"), "w") as fh:
        fh.write(build_tex())
    print("wrote doc/fsm_notes.tex, rtl/*.v, tb/*.v")
