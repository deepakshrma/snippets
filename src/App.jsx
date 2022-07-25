import {
  ArrowLeftOutlined,
  CopyOutlined,
  FastBackwardOutlined,
  ReloadOutlined,
  ShareAltOutlined,
  SmileFilled,
  SwapLeftOutlined,
  SwapRightOutlined,
} from "@ant-design/icons";
import { Button, Card, Layout, notification, Space, Spin, Switch, Tag, Tooltip, Typography } from "antd";
import html2canvas from "html2canvas";
import { shuffle, upperCase } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDarkReasonable as theme } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Controller, EffectCards } from "swiper";
import "swiper/css";
import "swiper/css/effect-cards";
import { Swiper, SwiperSlide } from "swiper/react";
import "./App.css";
import { fetchSnipets } from "./services/code";
import { useTheme } from "./theme/ThemeProvider";

const { Title } = Typography;
const { Content } = Layout;

const { Meta } = Card;
const openNotification = ({ placement = "bottom", description = "Code has been copied to clipboard" } = {}) => {
  notification.info({
    message: `Copy to Clipboard`,
    description,
    placement,
    icon: (
      <SmileFilled
        style={{
          color: "#F6B312",
        }}
      />
    ),
  });
};
function App() {
  const { isDark, setThemeDark } = useTheme();

  const [snippets, setSnippets] = useState([]);
  const [top10, setTop10] = useState([]);
  const [selected, setSelected] = useState();
  const [page, setPage] = useState({ page: 0, limit: 10 });
  const [controlledSwiper, setControlledSwiper] = useState(null);

  const codeBlock = useRef();

  useEffect(() => {
    fetchSnipets(
      "https://raw.githubusercontent.com/deepakshrma/30-seconds-of-typescript/master/snippets/typescript.json"
    )
      .then((r) => r.json())
      .then((m) => {
        const snippets = Object.values(m).map((snip) => {
          const id = snip.prefix;
          const prefix = snip.prefix.replace("30_", "");
          const name = upperCase(prefix).replace(/\W.+/, "");
          const body = snip.body?.join("\n");
          const description = body.split("*")[3];
          // const description = body.split("*")[3];
          const codeIndex = body.indexOf("export ");
          const comment = body.slice(0, codeIndex);
          const code = body.slice(codeIndex);
          return {
            ...snip,
            id,
            language: "typescript",
            body,
            code,
            comment,
            description,
            name,
            prefix,
          };
        });

        setSnippets(shuffle(snippets));
      });
  }, []);
  const pageCount = Math.ceil(snippets.length / page.limit);

  useEffect(() => {
    if (page.page <= pageCount) {
      setTop10(
        snippets
          .slice(page.page * page.limit, (page.page + 1) * page.limit)
          .sort((a, b) => a.body.length - b.body.length)
      );
    }
  }, [snippets, page]);

  useEffect(() => {
    if (!snippets.length || page.page) return;
    const params = new URLSearchParams(window.location.search);
    const planaguage = params.get("language");
    const pid = params.get("id");
    if (!pid || !planaguage) {
      return;
    }
    const snip = snippets.find(({ language, id }) => language === planaguage && id === pid);
    if (snip) {
      setSelected(snip);
    }
  }, [snippets, window.location]);

  const onRelaod = () => {
    if (page.page < pageCount - 1) {
      setPage({ ...page, page: page.page + 1 });
    } else {
      setPage({ ...page, page: 0 });
    }
    controlledSwiper.slideTo(0);
  };

  const onCopyImage = () => {
    html2canvas(codeBlock.current).then((canvas) => {
      canvas.toBlob((blob) => {
        (async function () {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob,
              }),
            ]);
            openNotification();
          } catch (error) {
            alert(error);
          }
        })();
      });
    });
  };
  if (!snippets.length) {
    return (
      <Space size="middle" tip="Loading...">
        <Spin size="large" />
      </Space>
    );
  }
  if (selected) {
    return (
      <div style={{ padding: 10, maxWidth: 800, margin: "0 auto" }}>
        <Space direction="vertical">
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              window.location.href = window.location.href.split("?")[0];
            }}
          >
            Home
          </Button>

          <CodeCard data={selected} />
        </Space>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: 10, maxWidth: 800, margin: "0 auto" }}>
      <Switch
        style={{ width: 100, alignSelf: "end" }}
        onChange={() => setThemeDark(!isDark)}
        checkedChildren="Light"
        unCheckedChildren="Dark"
        checked={isDark}
      />
      <Title level={3} style={{ textAlign: "center" }}>
        <SwapLeftOutlined />
        Swipe to Left or Right
        <SwapRightOutlined />
      </Title>
      <Space align="center" direction="vertical">
        <Button
          type="primary"
          size="large"
          style={{ width: 100 }}
          icon={<FastBackwardOutlined />}
          onClick={() => {
            setSnippets(shuffle(snippets));
          }}
        >
          Restart
        </Button>
      </Space>
      <Swiper
        // pagination={{
        //   type: "progressbar",
        // }}
        effect={"cards"}
        navigation={false}
        modules={[
          // Pagination,
          EffectCards,
          Controller,
        ]}
        onSwiper={setControlledSwiper}
        onSlideChange={({ activeIndex }) => {
          const { language, id } = top10[activeIndex] || {};
          window.history.replaceState(null, null, `?language=${language}&id=${id}`);
        }}
      >
        {top10.map((snip, i) => {
          return (
            <SwiperSlide key={`snippet__${snip.id}`} ref={codeBlock}>
              <CodeCard data={snip} index={i} />
            </SwiperSlide>
          );
        })}
        <SwiperSlide key={`snippet__reload`}>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              background: "#333",
              width: 400,
              height: 400,
              padding: 10,
            }}
            onClick={onRelaod}
          >
            <Title level={5}>Tap to Reload</Title>
            <Space direction="vertical" align="center">
              <ReloadOutlined style={{ fontSize: "40px", color: "#08c" }} />
            </Space>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );

  function CodeCard({ data, index = -1 }) {
    const { code, body, name, prefix, language, description, comment, id } = data;
    return (
      <Card
        style={{
          width: "100%",
          height: "100%",
        }}
        actions={[
          <Space>
            <Tooltip title="copy code Image to Clipboard">
              <Button type="primary" icon={<CopyOutlined />} onClick={onCopyImage}>
                Image
              </Button>
            </Tooltip>
            <CopyToClipboard text={code} onCopy={openNotification} key="copy code to clipboard">
              <Tooltip title="copy code to clipboard">
                <Button type="primary" icon={<CopyOutlined />}>
                  Code
                </Button>
              </Tooltip>
            </CopyToClipboard>
            <CopyToClipboard
              text={`${location.protocol + "//" + location.host}?language=${language}&id=${id}`}
              onCopy={() => openNotification({ description: "URL has been coppied to clipboard" })}
              key="Copy URL"
            >
              <Tooltip title="Copy URL">
                <Button type="primary" icon={<ShareAltOutlined />}>
                  Share
                </Button>
              </Tooltip>
            </CopyToClipboard>
          </Space>,
        ]}
      >
        <Meta
          title={<Title level={4}>{`${index + 1}. ${name}`}</Title>}
          description={
            <Title level={5}>
              <Tag color="#2db7f5">{language}</Tag>
              {description}
            </Title>
          }
        />
        <SyntaxHighlighter language={language} style={theme} wrapLines wrapLongLines>
          {comment}
        </SyntaxHighlighter>
        <SyntaxHighlighter language={language} style={theme} wrapLines wrapLongLines>
          {code}
        </SyntaxHighlighter>
        <div style={{ margin: "auto" }}></div>
      </Card>
    );
  }
}

export default App;
