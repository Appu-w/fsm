# FSM sequence detectors in Verilog: exam notes

- `doc/fsm_notes.pdf`: the notes (state diagrams, step-by-step transitions, trace tables, waveforms, code in slices)
- `rtl/`: synthesizable FSMs (`seq010_moore`, `seq010_mealy`, `det01x3`, `seq1011_mealy`, `seq101_moore`, `det11x2`, `div3_fsm`)
- `tb/`: testbenches that apply random input for 100 clocks (the Q1 and Q2 testbenches check themselves against golden models)
- `tools/gen_notes.py`: regenerates the `.tex`, RTL and TB from one Python model of each FSM

```
python3 tools/gen_notes.py && (cd doc && pdflatex fsm_notes.tex && pdflatex fsm_notes.tex)
iverilog -o sim rtl/seq010_moore.v tb/tb_seq010.v && vvp sim
```
