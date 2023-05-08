FROM kaldiasr/kaldi:latest

WORKDIR /usr/src/ptt

# install node and xz-utils

RUN wget --quiet -O - https://deb.nodesource.com/setup_14.x | bash - && apt-get install -y nodejs xz-utils


# install kaldi model

COPY ie.conf ./
RUN wget --quiet -O - https://github.com/rouseabout/zamia-speech/raw/master/asr-models/kaldi-generic-en-tdnn_f-r20190609.tar.xz | tar -xJf -


# install application and dependencies

COPY package.json ./
RUN npm install .
COPY server.js index.html ./


# default command

CMD npm start & /opt/kaldi/src/online2bin/online2-tcp-nnet3-decode-faster --endpoint.silence-phones=-1 --beam=7.0 --lattice-beam=8.0 --acoustic-scale=1.0 --frame-subsampling-factor=3 --mfcc-config=kaldi-generic-en-tdnn_f-r20190609/conf/mfcc_hires.conf --ivector-extraction-config=ie.conf kaldi-generic-en-tdnn_f-r20190609/model/final.mdl kaldi-generic-en-tdnn_f-r20190609/model/graph/HCLG.fst kaldi-generic-en-tdnn_f-r20190609/model/graph/words.txt
